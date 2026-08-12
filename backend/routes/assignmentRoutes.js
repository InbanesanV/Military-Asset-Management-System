import { Router } from 'express';
import {
  createAssignment,
  getAssignments,
  createExpenditure,
  getExpenditures,
} from '../controllers/assignmentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope, enforceBaseOwnership } from '../middlewares/rbacMiddleware.js';
import { auditMiddleware } from '../middlewares/loggerMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.use(auditMiddleware);

// Assignments — Admin and Base Commanders only
router.get('/assignments', enforceBaseScope, getAssignments);
router.post(
  '/assignments',
  authorizeRoles('ADMIN', 'BASE_COMMANDER'),
  enforceBaseOwnership,
  createAssignment
);

// Expenditures — Admin and Base Commanders only
router.get('/expenditures', enforceBaseScope, getExpenditures);
router.post(
  '/expenditures',
  authorizeRoles('ADMIN', 'BASE_COMMANDER'),
  enforceBaseOwnership,
  createExpenditure
);

export default router;
