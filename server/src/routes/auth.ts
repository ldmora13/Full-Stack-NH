import { Router } from 'express';
import { signup, login, logout, getMe } from '../controllers/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { signupSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);
router.get('/me', getMe);

export default router;
