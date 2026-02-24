import { transporter } from '../config/email';
import { resend } from '../config/resend';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export const EmailService = {
    sendEmail: async ({ to, subject, html }: EmailOptions) => {
        try {
            const { data, error } = await resend.emails.send({
                from: 'New Horizons <noreply@tudominio.com>',
                to,
                subject,
                html,
            });
            if (error) console.error('Resend error:', error);
            return data;
        } catch (error) {
            console.error('Error sending email:', error);
            return null;
        }
    },

    sendCheckoutCredentials: async (user: {
        email: string;
        name: string;
    }, credentials: {
        tempPassword: string;
        ticketId: number;
        programLabel: string;
        portalUrl: string;
    }) => {
        const subject = '🎉 Bienvenido a New Horizons — Tus Credenciales de Acceso';
        const html = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">¡Bienvenido a New Horizons!</h1>
                </div>
                <div style="background: #f9fafb; padding: 32px; border: 1px solid #e5e7eb;">
                    <p style="font-size: 16px;">Hola <strong>${user.name}</strong>,</p>
                    <p>Tu pago fue procesado exitosamente. Hemos creado tu cuenta en el portal para que puedas hacer seguimiento de tu proceso migratorio.</p>

                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 24px 0;">
                        <h2 style="margin: 0 0 16px; font-size: 16px; color: #374151;">📋 Resumen de tu solicitud</h2>
                        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Programa:</strong> ${credentials.programLabel}</p>
                        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Número de caso:</strong> #${credentials.ticketId}</p>
                    </div>

                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 24px; margin: 24px 0;">
                        <h2 style="margin: 0 0 16px; font-size: 16px; color: #1d4ed8;">🔐 Tus Credenciales de Acceso</h2>
                        <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${user.email}</p>
                        <p style="margin: 4px 0; font-size: 14px;"><strong>Contraseña temporal:</strong> 
                            <code style="background: #dbeafe; padding: 2px 8px; border-radius: 4px; font-size: 15px; letter-spacing: 1px;">${credentials.tempPassword}</code>
                        </p>
                        <p style="margin-top: 12px; font-size: 12px; color: #6b7280;">⚠️ Por seguridad, te recomendamos cambiar esta contraseña al iniciar sesión por primera vez.</p>
                    </div>

                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${credentials.portalUrl}" style="background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                            Acceder al Portal →
                        </a>
                    </div>

                    <p style="color: #6b7280; font-size: 13px;">Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este email.</p>
                </div>
                <div style="background: #1f2937; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© New Horizons Immigration Law • Todos los derechos reservados</p>
                </div>
            </div>
        `;
        return EmailService.sendEmail({ to: user.email, subject, html });
    },

    sendWelcomeEmail: async (user: { email: string; name: string }) => {
        const subject = 'Bienvenido a New Horizons';
        const html = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h1>¡Bienvenido, ${user.name}!</h1>
                <p>Gracias por registrarte en el Portal de New Horizons.</p>
                <p>Estamos aquí para acompañarte en tu proceso migratorio.</p>
                <p>Puedes iniciar sesión para ver el estado de tus trámites en cualquier momento.</p>
                <br>
                <p>Atentamente,</p>
                <p>El equipo de New Horizons</p>
            </div>
        `;
        return EmailService.sendEmail({ to: user.email, subject, html });
    },

    sendTicketStatusUpdate: async (ticket: { id: number; title: string; status: string }, user: { email: string; name: string }) => {
        const subject = `Actualización de Estado - Ticket #${ticket.id}`;
        const html = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Hola ${user.name},</h2>
                <p>El estado de tu ticket <strong>"${ticket.title}"</strong> ha cambiado.</p>
                <p><strong>Nuevo Estado:</strong> ${ticket.status}</p>
                <p>Por favor ingresa a la plataforma para ver más detalles.</p>
                <br>
                <a href="${process.env.CLIENT_URL}/tickets/${ticket.id}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Ticket</a>
                <br><br>
                <p>Atentamente,</p>
                <p>El equipo de New Horizons</p>
            </div>
        `;
        return EmailService.sendEmail({ to: user.email, subject, html });
    },

    sendAppointmentConfirmation: async (appointment: { date: Date; type: string }, user: { email: string; name: string }) => {
        const subject = 'Confirmación de Cita - New Horizons';
        const dateStr = new Date(appointment.date).toLocaleString();
        const html = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Cita Confirmada</h2>
                <p>Hola ${user.name}, tu cita ha sido agendada exitosamente.</p>
                <ul>
                    <li><strong>Tipo:</strong> ${appointment.type}</li>
                    <li><strong>Fecha y Hora:</strong> ${dateStr}</li>
                </ul>
                <p>Por favor asegúrate de estar puntual.</p>
                <br>
                <p>Atentamente,</p>
                <p>El equipo de New Horizons</p>
            </div>
        `;
        return EmailService.sendEmail({ to: user.email, subject, html });
    }
};
