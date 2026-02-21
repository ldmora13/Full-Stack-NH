import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const verifyConnection = async () => {
    try {
        await transporter.verify();
        console.log('Server is ready to take our messages');
        return true;
    } catch (error) {
        console.error('Error verifying email connection:', error);
        return false;
    }
};
