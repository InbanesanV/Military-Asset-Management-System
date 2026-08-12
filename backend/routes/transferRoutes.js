import { Router } from 'express';
import { createTransfer, getTransfers } from '../controllers/transferController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';
import { auditMiddleware } from '../middlewares/loggerMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.use(auditMiddleware);

// Only ADMIN and LOGISTICS_OFFICER can initiate transfers
router.get('/', enforceBaseScope, getTransfers);
router.post('/', authorizeRoles('ADMIN', 'LOGISTICS_OFFICER'), createTransfer);

export default router;
