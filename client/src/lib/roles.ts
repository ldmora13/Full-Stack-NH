/** Same operational access as admin except user management (UI + API). */
export function isStaffAdmin(role?: string | null): boolean {
    return role === 'ADMIN' || role === 'COORDINATOR' || role === 'ADVISOR';
}

export function isAdminOnly(role?: string | null): boolean {
    return role === 'ADMIN';
}

export function canAccessAssignmentPage(role?: string | null): boolean {
    return role === 'ADMIN' || role === 'COORDINATOR';
}
