import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
const router = Router();
router.get('/', protect, restrictTo('HR', 'Manager'), dashboardController.getDashboardStats);
export default router;
