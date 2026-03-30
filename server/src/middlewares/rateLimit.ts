import rateLimit from 'express-rate-limit';

// Límite global: 100 requests por 15 minutos
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests, please try again later.'
    }
});

// Límite de auth: 5 intentos por hora
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many login attempts, please try again later.'
    }
});

// 3 checkouts por hora por IP
export const checkoutLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many checkout attempts. Please try again later or contact support.'
    },
    skip: (req) => req.path.includes('/capture') ? false : false,
});