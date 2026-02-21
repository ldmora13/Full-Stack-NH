import { Prisma, User } from '@prisma/client';
import { db } from '../lib/db';

export class UserRepository {
    async create(data: Prisma.UserCreateInput): Promise<User> {
        return db.user.create({ data });
    }

    async findByEmail(email: string): Promise<User | null> {
        return db.user.findUnique({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return db.user.findUnique({ where: { id } });
    }

    async findAll(where: Prisma.UserWhereInput): Promise<User[]> {
        return db.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return db.user.update({
            where: { id },
            data,
        });
    }
}
