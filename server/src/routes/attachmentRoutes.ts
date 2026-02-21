import { Router } from 'express';
import { uploadAttachment, getAttachments } from '../controllers/AttachmentController';
import { verifyAuth as isAuth } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router({ mergeParams: true }); // Merge params to access ticketId from parent route

router.use(isAuth);

router.post('/', upload.single('file'), uploadAttachment);
router.get('/', getAttachments);

export default router;
