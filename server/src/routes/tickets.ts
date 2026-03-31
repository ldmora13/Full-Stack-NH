import { Router } from 'express';
import { verifyAuth } from '../middlewares/authMiddleware';
import { requireAdminCoordinatorOrAdvisor, requireAdminOrCoordinator } from '../middlewares/roleMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
    createTicketSchema,
    updateTicketSchema,
    getTicketsSchema,
    assignAdvisorSchema,
} from '../schemas/ticket.schema';
import {
    createTicket,
    getTickets,
    getTicketById,
    updateTicket,
    assignAdvisor,
} from '../controllers/tickets';

const router = Router();

router.use(verifyAuth); // Proteger todas las rutas de tickets

router.post('/', validateRequest(createTicketSchema), createTicket);
router.get('/', validateRequest(getTicketsSchema), getTickets);
router.post(
    '/:id/assign-advisor',
    requireAdminOrCoordinator,
    validateRequest(assignAdvisorSchema),
    assignAdvisor
);
router.get('/:id', getTicketById);
router.patch('/:id', validateRequest(updateTicketSchema), updateTicket);
router.patch(
    '/:id/assign',
    requireAdminCoordinatorOrAdvisor,
    validateRequest(updateTicketSchema),
    updateTicket
);

export default router;
