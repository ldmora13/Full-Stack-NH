import { Appointment, Prisma } from '@prisma/client';
import { db } from '../lib/db';
import { AppError } from '../utils/AppError';
import { EmailService } from './emailService';

export class AppointmentService {
    async createAppointment(data: {
        date: string;
        type: string;
        ticketId: number;
        link?: string;
    }): Promise<Appointment> {
        const appointmentDate = new Date(data.date);

        // Basic availability check (prevent double booking for same ticket at same time)
        const existingAppointment = await db.appointment.findFirst({
            where: {
                ticketId: data.ticketId,
                date: appointmentDate,
                status: { not: 'CANCELLED' }
            }
        });

        if (existingAppointment) {
            throw new AppError('Appointment already exists for this ticket at this time', 400);
        }

        const appointment = await db.appointment.create({
            data: {
                date: appointmentDate,
                type: data.type,
                ticket: { connect: { id: data.ticketId } },
                link: data.link,
                status: 'SCHEDULED'
            },
            include: {
                ticket: {
                    include: {
                        client: { select: { name: true, email: true } }
                    }
                }
            }
        });

        // Send confirmation email
        if (appointment.ticket.client?.email) {
            await EmailService.sendAppointmentConfirmation(appointment, appointment.ticket.client);
        }

        return appointment;
    }

    async getAppointments(params: {
        userId: string;
        role: string;
        ticketId?: number;
    }) {
        const where: Prisma.AppointmentWhereInput = {};

        if (params.ticketId) {
            where.ticketId = Number(params.ticketId);
        }

        if (params.role === 'CLIENT') {
            where.ticket = { clientId: params.userId };
        } else if (params.role === 'ADVISOR') {
            where.ticket = { advisorId: params.userId };
        }

        return db.appointment.findMany({
            where,
            include: {
                ticket: {
                    select: {
                        title: true,
                        client: { select: { name: true } },
                        advisor: { select: { name: true } }
                    }
                }
            },
            orderBy: { date: 'asc' }
        });
    }

    async updateStatus(id: number, status: string): Promise<Appointment> {
        return db.appointment.update({
            where: { id },
            data: { status }
        });
    }
}
