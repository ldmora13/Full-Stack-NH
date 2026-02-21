import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

import authRoutes from './routes/auth';
import ticketRoutes from './routes/tickets';
import userRoutes from './routes/users';
import commentRoutes from './routes/comments';
import attachmentRoutes from './routes/attachmentRoutes';
import statsRoutes from './routes/stats';
import paymentRoutes from './routes/paymentRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import cookieParser from 'cookie-parser';
import { apiLimiter, authLimiter } from './middlewares/rateLimit';

import publicRoutes from './routes/publicRoutes';

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:4321', 'https://newhorizonsimmigrationlaw.org'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Apply global API limiter
app.use('/api', apiLimiter);

// Specific stricter limiter for auth
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

import swaggerUi from 'swagger-ui-express';
import { generateOpenApiSpec } from './lib/openApi';
import './docs/auth.docs';
import './docs/tickets.docs';
import './docs/users.docs';

app.use('/api/public', publicRoutes); // Mount public routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api', commentRoutes);
app.use('/api', attachmentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/tickets/:ticketId/attachments', attachmentRoutes);

// Error handling logics
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(generateOpenApiSpec()));

app.get('/', (req: Request, res: Response) => {
    res.send('Advisory Tickets API Running');
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
