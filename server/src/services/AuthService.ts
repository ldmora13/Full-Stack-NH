import { UserService } from './UserService';
import { UserRepository } from '../repositories/UserRepository';
import { lucia } from '../lib/auth';
import { verify } from '@node-rs/argon2';
import { AppError } from '../utils/AppError';
import { User } from '@prisma/client';
import { EmailService } from './emailService';

export class AuthService {
    private userService: UserService;
    private userRepository: UserRepository;

    constructor() {
        this.userService = new UserService();
        this.userRepository = new UserRepository();
    }

    async signup(data: { email: string; password: string; name: string; role?: 'ADMIN' | 'ADVISOR' | 'CLIENT' }) {
        // Check if user exists happens in UserService.createUser
        const user = await this.userService.createUser({
            email: data.email,
            password: data.password,
            name: data.name,
            role: data.role || 'CLIENT'
        });

        await EmailService.sendWelcomeEmail(user);

        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        return { user, sessionCookie };
    }

    async login(data: { email: string; password: string }) {
        const user = await this.userRepository.findByEmail(data.email);

        if (!user) {
            throw new AppError('Invalid credentials', 400);
        }

        const validPassword = await verify(user.password, data.password);
        if (!validPassword) {
            throw new AppError('Invalid credentials', 400);
        }

        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        return { user, sessionCookie };
    }

    async logout(sessionId: string) {
        await lucia.invalidateSession(sessionId);
        return lucia.createBlankSessionCookie();
    }

    async validateSession(sessionId: string) {
        return lucia.validateSession(sessionId);
    }
}
