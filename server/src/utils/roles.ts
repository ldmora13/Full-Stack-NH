/** Roles with full staff visibility (all tickets, stats, assignment tools). */
export function isStaffAdminRole(role: string): boolean {
    return role === 'ADMIN' || role === 'COORDINATOR';
}

/** Can list users API (advisors/clients) for filters and assignment. */
export function canListUsersForStaff(role: string): boolean {
    return role === 'ADMIN' || role === 'COORDINATOR' || role === 'ADVISOR';
}

/** Only true admins may create/update users or login-as. */
export function canManageUsers(role: string): boolean {
    return role === 'ADMIN';
}
