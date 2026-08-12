import { Router } from 'express';
import { adminDashboard, brokerDashboard, updateVisitStatus } from '../controllers/dashboardController.js';
import { ROLES } from '../config/constants.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/broker', authorize(ROLES.BROKER), brokerDashboard);
router.get('/admin', authorize(ROLES.ADMIN), adminDashboard);
router.patch('/admin/visits/:id', authorize(ROLES.ADMIN), updateVisitStatus);

export default router;
