import { Router } from 'express';
import { verifyAuth } from '../middlewares/authMiddleware';
import { getTicketStats, getRecentActivity } from '../controllers/stats';

const router = Router();

// All stats routes require authentication
router.use(verifyAuth);

router.get('/tickets', getTicketStats);
router.get('/activity', getRecentActivity);

export default router;
