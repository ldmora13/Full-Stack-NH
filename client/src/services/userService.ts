import api from '../lib/api';

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'CLIENT' | 'ADMIN' | 'ADVISOR';
    createdAt: string;
}

export interface CreateUserData {
    email: string;
    password: string;
    name: string;
    role: 'CLIENT' | 'ADMIN' | 'ADVISOR';
}

export const UserService = {
    getAll: async (role?: 'CLIENT' | 'ADMIN' | 'ADVISOR') => {
        const params = role ? { role } : {};
        const { data } = await api.get<{ users: User[] }>('/users', { params });
        return data.users;
    },

    create: async (userData: CreateUserData) => {
        const { data } = await api.post<{ user: User }>('/users', userData);
        return data.user;
    },

    update: async (id: string, updates: Partial<Pick<User, 'name' | 'role'>>) => {
        const { data } = await api.post<{ user: User }>(`/users/${id}`, updates);
        return data.user;
    },

    loginAs: async (userId: string) => {
        const { data } = await api.post<{ user: User }>(`/users/${userId}/login-as`);
        return data.user;
    },
};
