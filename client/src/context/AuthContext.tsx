import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/api';
import type { User, AuthResponse } from '../types/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const { data } = await api.get<AuthResponse>('/auth/me');
            setUser(data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(credentials: any) {
        const { data } = await api.post<AuthResponse>('/auth/login', credentials);
        setUser(data.user);
    }

    async function signup(credentials: any) {
        const { data } = await api.post<AuthResponse>('/auth/signup', credentials);
        setUser(data.user);
    }

    async function logout() {
        await api.post('/auth/logout');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
