import { Router } from 'express';
import { initCheckout, captureCheckout } from '../controllers/PublicCheckoutController';

const router = Router();

// Public routes - No authentication required
// Rate limiting should be applied in index.ts or here

router.post('/checkout/init', initCheckout);
router.post('/checkout/capture', captureCheckout);

export default router;
