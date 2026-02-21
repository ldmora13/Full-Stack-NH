import { Router } from 'express';
import { createAppointment, getAppointments, updateAppointmentStatus } from '../controllers/AppointmentController';
import { verifyAuth as isAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(isAuth);

router.get('/', getAppointments);
router.post('/', createAppointment);
router.patch('/:id/status', updateAppointmentStatus);

export default router;
