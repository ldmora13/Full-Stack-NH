import { Router } from 'express';
import { getUsers, createUser, updateUser } from '../controllers/users';
import { loginAs } from '../controllers/loginAs';
import { verifyAuth } from '../middlewares/authMiddleware';
import { requireAdmin, requireAdminOrAdvisor } from '../middlewares/roleMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createUserSchema, updateUserSchema, getUsersSchema } from '../schemas/user.schema';

const router = Router();


router.use(verifyAuth);

router.get('/', requireAdminOrAdvisor, validateRequest(getUsersSchema), getUsers);

router.post('/', requireAdmin, validateRequest(createUserSchema), createUser);

router.patch('/:id', requireAdmin, validateRequest(updateUserSchema), updateUser);

router.post('/:userId/login-as', requireAdmin, loginAs);

export default router;