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
        scheduledById?: string; // el advisor/admin que agenda
    }): Promise<Appointment> {
        const appointmentDate = new Date(data.date);

        if (isNaN(appointmentDate.getTime())) {
            throw new AppError('Invalid appointment date', 400);
        }

        // No permitir citas en el pasado
        if (appointmentDate < new Date()) {
            throw new AppError('Appointment date cannot be in the past', 400);
        }

        // Verificar que el ticket existe
        const ticket = await db.ticket.findUnique({
            where: { id: data.ticketId },
            include: {
                client: { select: { name: true, email: true } }
            }
        });

        if (!ticket) {
            throw new AppError('Ticket not found', 404);
        }

        // Prevenir doble booking para el mismo ticket en el mismo horario
        const existingAppointment = await db.appointment.findFirst({
            where: {
                ticketId: data.ticketId,
                date: appointmentDate,
                status: { not: 'CANCELLED' }
            }
        });

        if (existingAppointment) {
            throw new AppError('An appointment already exists for this ticket at this time', 409);
        }

        const appointment = await db.appointment.create({
            data: {
                date: appointmentDate,
                type: data.type,
                ticket: { connect: { id: data.ticketId } },
                link: data.link,
                status: 'SCHEDULED',
                // FIX #19: Registrar quién agendó
                ...(data.scheduledById && {
                    scheduledBy: { connect: { id: data.scheduledById } }
                }),
            },
            include: {
                ticket: {
                    include: {
                        client: { select: { name: true, email: true } }
                    }
                },
                scheduledBy: {
                    select: { name: true, email: true }
                }
            }
        });

        const clientEmail = (appointment as any).ticket?.client?.email;
        if (clientEmail) {
            try {
                await EmailService.sendAppointmentConfirmation(
                    appointment,
                    { email: clientEmail, name: (appointment as any).ticket.client.name }
                );
            } catch (emailError) {
                console.error('Failed to send appointment confirmation email:', emailError);
            }
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
                },
                scheduledBy: {
                    select: { name: true, role: true }
                }
            },
            orderBy: { date: 'asc' }
        });
    }

    async updateStatus(id: number, status: string, userId: string, userRole: string): Promise<Appointment> {
        const validStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
        }

        const appointment = await db.appointment.findUnique({ where: { id } });
        if (!appointment) {
            throw new AppError('Appointment not found', 404);
        }

        return db.appointment.update({
            where: { id },
            data: { status }
        });
    }
}