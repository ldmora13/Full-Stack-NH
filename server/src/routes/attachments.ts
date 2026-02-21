import { Router } from 'express';
import { uploadAttachment, getAttachments } from '../controllers/attachments';
import { verifyAuth } from '../middlewares/authMiddleware';

const router = Router();

// All attachment routes require authentication
router.use(verifyAuth);

// Get attachments for a ticket
router.get('/tickets/:ticketId/attachments', getAttachments);

// Upload attachment to a ticket
router.post('/tickets/:ticketId/attachments', uploadAttachment);

export default router;
