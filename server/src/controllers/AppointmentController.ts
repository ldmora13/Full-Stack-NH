import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppointmentService } from '../services/AppointmentService';

const appointmentService = new AppointmentService();

export const createAppointment = catchAsync(async (req: Request, res: Response) => {
    const { date, type, ticketId, link } = req.body;

    const appointment = await appointmentService.createAppointment({
        date,
        type,
        ticketId: Number(ticketId),
        link
    });

    res.status(201).json({ appointment });
});

export const getAppointments = catchAsync(async (req: Request, res: Response) => {
    const user = res.locals.user;
    const { ticketId } = req.query;

    const appointments = await appointmentService.getAppointments({
        userId: user.id,
        role: user.role,
        ticketId: ticketId ? Number(ticketId) : undefined
    });

    res.json({ appointments });
});

export const updateAppointmentStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await appointmentService.updateStatus(Number(id), status);

    res.json({ appointment });
});
