import { transporter } from '../config/email';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export const EmailService = {
    sendEmail: async ({ to, subject, html }: EmailOptions) => {
        try {
            const info = await transporter.sendMail({
                from: `New Horizons <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to,
                subject,
                html,
            });
            console.log('Message sent: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            // Don't throw error to prevent blocking the main flow
            return null;
        }
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
