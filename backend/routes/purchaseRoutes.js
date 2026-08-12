import { Router } from 'express';
import { createPurchase, getPurchases } from '../controllers/purchaseController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope, enforceBaseOwnership } from '../middlewares/rbacMiddleware.js';
import { auditMiddleware } from '../middlewares/loggerMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.use(auditMiddleware);

// Admins, Base Commanders (own base), and Logistics Officers can manage purchases
router.get('/', enforceBaseScope, getPurchases);
router.post(
  '/',
  authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'),
  enforceBaseOwnership,
  createPurchase
);

export default router;
