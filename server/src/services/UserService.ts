import { User, Prisma } from '@prisma/client';
import { UserRepository } from '../repositories/UserRepository';
import { AppError } from '../utils/AppError';
import { hash } from '@node-rs/argon2';

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new AppError('User with this email already exists', 400);
        }

        const hashedPassword = await hash(data.password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
        });

        // We cast data.role as any because TypeScript generic issues with Prisma Enums sometimes
        return this.userRepository.create({
            ...data,
            password: hashedPassword,
        });
    }

    async getUsers(role?: 'ADMIN' | 'ADVISOR' | 'CLIENT'): Promise<User[]> {
        const where: Prisma.UserWhereInput = role ? { role } : {};
        return this.userRepository.findAll(where);
    }

    async updateUser(id: string, data: { name?: string; role?: 'ADMIN' | 'ADVISOR' | 'CLIENT' }): Promise<User> {
        return this.userRepository.update(id, data);
    }
}
