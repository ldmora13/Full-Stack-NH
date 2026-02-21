import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { client } from '../config/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { db } from '../lib/db';
import { AppError } from '../utils/AppError';
import { PROGRAM_PRICING, calculateTotal, ProgramId } from '../config/pricing';
import { hash } from '@node-rs/argon2';
import { TicketType, Priority } from '@prisma/client';

export const initCheckout = catchAsync(async (req: Request, res: Response) => {
    const { programId, adults, children } = req.body;

    if (!PROGRAM_PRICING[programId as ProgramId]) {
        throw new AppError('Invalid program selected', 400);
    }

    const totalAmount = calculateTotal(programId as ProgramId, Number(adults), Number(children));

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
            custom_id: JSON.stringify({ programId, adults, children }) // Store metadata
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

    // 2. Parse Metadata (relying on what we sent or just using request body if needed, 
    // but better to verify with what user selected)
    // For simplicity, we assume clientDetails passed from frontend matches intent.
    // Ideally we read custom_id but PayPal sometimes truncates it. 
    // We will trust the successful payment amount and create the services accordingly.

    // 3. Find or Create User
    let user = await db.user.findUnique({ where: { email: clientDetails.email } });
    let isNewUser = false;
    let tempPassword = '';

    if (!user) {
        isNewUser = true;
        tempPassword = Math.random().toString(36).slice(-8) + 'A1!'; // Simple random password

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

    // 4. Create Ticket (Map Program ID to TicketType)
    // Mapping EB-1 -> IMMIGRATION, etc. For now defaulting to IMMIGRATION type
    // We need to support the types defined in TicketType enum: VISA, CITIZENSHIP, IMMIGRATION, LEGAL_ADVICE

    // We can infer type from programId or just use IMMIGRATION for all "Programs"
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

    // 5. Record Payment
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

    // 6. Response
    res.json({
        status: 'SUCCESS',
        isNewUser,
        tempPassword: isNewUser ? tempPassword : null, // In production, SEND VIA USER EMAIL ONLY
        ticketId: ticket.id,
        userEmail: user.email
    });
});
