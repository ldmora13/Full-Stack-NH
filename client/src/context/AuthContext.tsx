import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/api';
import type { User, AuthResponse, ChangePasswordData } from '../types/auth';

// Tipos correctos — login y signup reciben objetos, no parámetros separados
interface LoginCredentials {
    email: string;
    password: string;
}

interface SignupCredentials {
    email: string;
    password: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    signup: (credentials: SignupCredentials) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (data: ChangePasswordData) => Promise<void>;
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

    // Firma tipada correctamente
    async function login(credentials: LoginCredentials) {
        const { data } = await api.post<AuthResponse>('/auth/login', credentials);
        setUser(data.user);
    }

    async function signup(credentials: SignupCredentials) {
        const { data } = await api.post<AuthResponse>('/auth/signup', credentials);
        setUser(data.user);
    }

    async function logout() {
        await api.post('/auth/logout');
        setUser(null);
    }

    async function changePassword(data: ChangePasswordData) {
        await api.patch('/auth/change-password', data);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, changePassword, setUser }}>
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