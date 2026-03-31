import { describe, it, expect } from 'vitest';
import { isStaffAdminRole, canListUsersForStaff, canManageUsers } from './roles';

describe('roles', () => {
    it('treats ADMIN and COORDINATOR as staff admin for ticket scope', () => {
        expect(isStaffAdminRole('ADMIN')).toBe(true);
        expect(isStaffAdminRole('COORDINATOR')).toBe(true);
        expect(isStaffAdminRole('ADVISOR')).toBe(false);
        expect(isStaffAdminRole('CLIENT')).toBe(false);
    });

    it('allows only ADMIN to manage users', () => {
        expect(canManageUsers('ADMIN')).toBe(true);
        expect(canManageUsers('COORDINATOR')).toBe(false);
        expect(canManageUsers('ADVISOR')).toBe(false);
    });

    it('allows coordinators to list users alongside admin and advisor', () => {
        expect(canListUsersForStaff('COORDINATOR')).toBe(true);
        expect(canListUsersForStaff('ADMIN')).toBe(true);
        expect(canListUsersForStaff('ADVISOR')).toBe(true);
        expect(canListUsersForStaff('CLIENT')).toBe(false);
    });
});
