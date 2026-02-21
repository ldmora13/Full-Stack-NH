import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { client } from '../config/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { db } from '../lib/db';
import { AppError } from '../utils/AppError';

export const createOrder = catchAsync(async (req: Request, res: Response) => {
    const { ticketId, amount } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: amount
            },
            custom_id: ticketId.toString() // Link order to ticket
        }]
    });

    const order = await client.execute(request);

    res.json({
        id: order.result.id
    });
});

export const captureOrder = catchAsync(async (req: Request, res: Response) => {
    const { orderID, ticketId } = req.body;
    const user = res.locals.user;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        const capture = await client.execute(request);

        // Save payment to database
        // @ts-ignore - PayPal types are tricky
        const captureData = capture.result.purchase_units[0].payments.captures[0];

        const payment = await db.payment.create({
            data: {
                amount: parseFloat(captureData.amount.value),
                currency: captureData.amount.currency_code,
                status: 'COMPLETED',
                paypalOrderId: orderID,
                userId: user.id,
                ticketId: Number(ticketId)
            }
        });

        // Send confirmation email ? (Maybe later)
        // Update ticket if needed (e.g. move to next stage)

        res.json({ status: 'COMPLETED', payment });
    } catch (error) {
        throw new AppError('Payment capture failed', 400);
    }
});
