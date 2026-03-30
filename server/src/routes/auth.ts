import { Router } from 'express';
import { signup, login, logout, getMe, changePassword } from '../controllers/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { signupSchema, loginSchema, changePasswordSchema } from '../schemas/auth.schema';
import { verifyAuth } from '../middlewares/authMiddleware';

const router = Router();

router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);
router.get('/me', getMe);

router.patch('/change-password', verifyAuth, validateRequest(changePasswordSchema), changePassword);

export default router;