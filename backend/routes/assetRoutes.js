import { Router } from 'express';
import {
  getDashboardMetrics,
  getBasesOverview,
  getChartData,
  getEquipmentTypes,
  getBases,
} from '../controllers/assetController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', enforceBaseScope, getDashboardMetrics);
router.get('/bases-overview', getBasesOverview);
router.get('/chart', enforceBaseScope, getChartData);
router.get('/equipment-types', getEquipmentTypes);
router.get('/bases', getBases);

export default router;
