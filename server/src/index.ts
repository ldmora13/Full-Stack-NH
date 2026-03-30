import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// CORS desde variable de entorno en lugar de hardcodeado
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [
        'http://localhost:5173',
        'http://localhost:4321',
        'https://newhorizonsimmigrationlaw.org',
        'https://app.newhorizonsimmigrationlaw.org'
    ];

import authRoutes from './routes/auth';
import ticketRoutes from './routes/tickets';
import userRoutes from './routes/users';
import commentRoutes from './routes/comments';
import attachmentRoutes from './routes/attachmentRoutes';
import statsRoutes from './routes/stats';
import paymentRoutes from './routes/paymentRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import publicRoutes from './routes/publicRoutes';
import cookieParser from 'cookie-parser';
import { apiLimiter, authLimiter, checkoutLimiter } from './middlewares/rateLimit';
import { AppError } from './utils/AppError';

import swaggerUi from 'swagger-ui-express';
import { generateOpenApiSpec } from './lib/openApi';
import './docs/auth.docs';
import './docs/tickets.docs';
import './docs/users.docs';

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Rate limiting global
app.use('/api', apiLimiter);

// Rate limits específicos más estrictos
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// Rate limit específico para checkout público
app.use('/api/public/checkout', checkoutLimiter);

// Rutas
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api', commentRoutes);
app.use('/api', attachmentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/tickets/:ticketId/attachments', attachmentRoutes);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(generateOpenApiSpec()));

app.get('/', (req: Request, res: Response) => {
    res.send('New Horizons Immigration API');
});

// Error handler global — captura todos los errores de catchAsync y otros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // Error operacional conocido (AppError)
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // Error de Prisma — violación de constraint única
    if ((err as any).code === 'P2002') {
        return res.status(409).json({ error: 'A record with this data already exists' });
    }

    // Error de Prisma — registro no encontrado
    if ((err as any).code === 'P2025') {
        return res.status(404).json({ error: 'Record not found' });
    }

    // Error desconocido — no exponer detalles en producción
    console.error('[Unhandled Error]', err);
    return res.status(500).json({
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { message: err.message, stack: err.stack })
    });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});