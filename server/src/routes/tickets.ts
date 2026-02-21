import { Router } from 'express';
import { verifyAuth } from '../middlewares/authMiddleware';
import { requireAdminOrAdvisor } from '../middlewares/roleMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createTicketSchema, updateTicketSchema, getTicketsSchema } from '../schemas/ticket.schema';
import { createTicket, getTickets, getTicketById, updateTicket } from '../controllers/tickets';

const router = Router();

router.use(verifyAuth); // Proteger todas las rutas de tickets

router.post('/', validateRequest(createTicketSchema), createTicket);
router.get('/', validateRequest(getTicketsSchema), getTickets);
router.get('/:id', getTicketById);
router.patch('/:id', validateRequest(updateTicketSchema), updateTicket);
router.patch('/:id/assign', requireAdminOrAdvisor, validateRequest(updateTicketSchema), updateTicket);

export default router;
