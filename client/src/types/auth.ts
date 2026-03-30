export interface User {
    id: string;
    email: string;
    name: string;
    role: 'CLIENT' | 'ADMIN' | 'ADVISOR';
}

export interface AuthResponse {
    user: User;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export interface ErrorResponse {
    error: string;
}
