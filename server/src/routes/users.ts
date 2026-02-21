import { Router } from 'express';
import { getUsers, createUser, updateUser } from '../controllers/users';
import { loginAs } from '../controllers/loginAs';
import { verifyAuth } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/roleMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createUserSchema, updateUserSchema, getUsersSchema } from '../schemas/user.schema';

const router = Router();

// All user routes require authentication
router.use(verifyAuth);

// Get users - admin only (but allow role filtering for advisor to get clients)
router.get('/', validateRequest(getUsersSchema), getUsers);

// Create user - admin only
router.post('/', requireAdmin, validateRequest(createUserSchema), createUser);

// Update user - admin only
router.patch('/:id', requireAdmin, validateRequest(updateUserSchema), updateUser);

// Login as user - admin only (for testing/development)
router.post('/:userId/login-as', requireAdmin, loginAs);

export default router;
