import { Router } from 'express';
import { createOrder, captureOrder } from '../controllers/PaymentController';
import { verifyAuth as isAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(isAuth);

router.post('/create-order', createOrder);
router.post('/capture-order', captureOrder);

export default router;
