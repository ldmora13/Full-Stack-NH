import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const validateRequest = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                }));
                next(new AppError('Validation Error', 400)); // TODO: Mejorar estructura de error para devolver detalles
            } else {
                next(error);
            }
        }
    };
};
