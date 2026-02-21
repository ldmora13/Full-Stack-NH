import { Router } from 'express';
import { getCommentsByTicket, createComment } from '../controllers/comments';
import { verifyAuth } from '../middlewares/authMiddleware';

const router = Router();

// All comment routes require authentication
router.use(verifyAuth);

// Get comments for a ticket
router.get('/tickets/:ticketId/comments', getCommentsByTicket);

// Create comment for a ticket
router.post('/tickets/:ticketId/comments', createComment);

export default router;
