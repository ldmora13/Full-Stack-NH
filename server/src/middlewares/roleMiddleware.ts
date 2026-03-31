import { Request, Response, NextFunction } from 'express';
import { canManageUsers, canListUsersForStaff } from '../utils/roles';

/** Only ADMIN — user CRUD, impersonation. */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!canManageUsers(user.role)) {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
};

/** ADMIN, COORDINATOR, or ADVISOR — e.g. GET /users for listing advisors/clients. */
export const requireAdminOrAdvisor = (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!canListUsersForStaff(user.role)) {
        return res.status(403).json({ error: 'Forbidden: Admin, Coordinator, or Advisor access required' });
    }

    next();
};

/** ADMIN or COORDINATOR — same visibility as admin except user management routes. */
export const requireAdminOrCoordinator = (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role !== 'ADMIN' && user.role !== 'COORDINATOR') {
        return res.status(403).json({ error: 'Forbidden: Admin or Coordinator access required' });
    }

    next();
};

/** ADMIN, COORDINATOR, or ADVISOR — ticket assignment (legacy PATCH /assign). */
export const requireAdminCoordinatorOrAdvisor = (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!['ADMIN', 'COORDINATOR', 'ADVISOR'].includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }

    next();
};
