import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { client } from '../config/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { db } from '../lib/db';
import { AppError } from '../utils/AppError';
import { PROGRAM_PRICING, ProgramId } from '../config/pricing';
import { hash } from '@node-rs/argon2';
import { TicketType, Priority } from '@prisma/client';
import { EmailService } from '../services/emailService';

export const initCheckout = catchAsync(async (req: Request, res: Response) => {
    const { programId, amount, adults, children } = req.body;

    if (!PROGRAM_PRICING[programId as ProgramId]) {
        throw new AppError('Invalid program selected', 400);
    }

    // Use the amount sent from the frontend directly — no server-side recalculation
    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
        throw new AppError('Invalid amount provided', 400);
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: totalAmount.toFixed(2)
            },
            description: `${PROGRAM_PRICING[programId as ProgramId].label} - ${adults} Adults, ${children} Children`,
            custom_id: JSON.stringify({ programId, adults, children })
        }]
    });

    try {
        const order = await client.execute(request);
        res.json({
            id: order.result.id,
            totalAmount: totalAmount
        });
    } catch (err) {
        console.error('PayPal Order Creation Failed:', err);
        throw new AppError('Could not initiate payment', 500);
    }
});

export const captureCheckout = catchAsync(async (req: Request, res: Response) => {
    const { orderID, clientDetails } = req.body;

    if (!clientDetails?.email || !clientDetails?.fullName) {
        throw new AppError('Invalid client details', 400);
    }

    // 1. Capture Payment
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    // @ts-ignore - PayPal types issue with empty body
    request.requestBody({});

    let capture;
    try {
        capture = await client.execute(request);
    } catch (err) {
        console.error('PayPal Capture Failed:', err);
        throw new AppError('Payment capture failed', 400);
    }

    const captureData = capture.result.purchase_units[0].payments.captures[0];

    // 2. Find or Create User
    let user = await db.user.findUnique({ where: { email: clientDetails.email } });
    let isNewUser = false;
    let tempPassword = '';

    if (!user) {
        isNewUser = true;
        tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

        const hashedPassword = await hash(tempPassword, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
        });

        user = await db.user.create({
            data: {
                name: clientDetails.fullName,
                email: clientDetails.email,
                password: hashedPassword,
                role: 'CLIENT'
            }
        });
    }

    // 3. Map program label to ticket type
    let ticketType: TicketType;

    switch (clientDetails.programLabel) {
        case 'Passeport Talent':
            ticketType = TicketType.WORK_VISA;
            break;
        case 'VLS-TS Salarié / Visitor':
            ticketType = TicketType.WORK_VISA;
            break;
        case 'Business / Investor':
            ticketType = TicketType.RESIDENCY;
            break;
        default:
            ticketType = TicketType.OTHER;
    }

    const ticket = await db.ticket.create({
        data: {
            title: `Process: ${clientDetails.programLabel}`,
            description: `Immigration process for ${clientDetails.programLabel}. Family: ${clientDetails.adults} Adults, ${clientDetails.children} Children. Address: ${clientDetails.address}, ${clientDetails.city}, ${clientDetails.country}.`,
            status: 'OPEN',
            priority: 'MEDIUM' as Priority,
            type: ticketType,
            clientId: user.id
        }
    });

    // 4. Record Payment — uses the actual captured amount from PayPal
    await db.payment.create({
        data: {
            amount: parseFloat(captureData.amount.value),
            currency: captureData.amount.currency_code,
            status: 'COMPLETED',
            paypalOrderId: orderID,
            userId: user.id,
            ticketId: ticket.id
        }
    });

    // 5. Send credentials email (only for new users)
    if (isNewUser && tempPassword) {
        await EmailService.sendCheckoutCredentials(
            { email: user.email, name: user.name },
            {
                tempPassword,
                ticketId: ticket.id,
                programLabel: clientDetails.programLabel,
                portalUrl: process.env.CLIENT_URL || 'https://app.newhorizonsimmigrationlaw.org/login',
            }
        );
    }

    // 6. Response
    res.json({
        status: 'SUCCESS',
        isNewUser,
        tempPassword: isNewUser ? tempPassword : null,
        ticketId: ticket.id,
        userEmail: user.email
    });
});