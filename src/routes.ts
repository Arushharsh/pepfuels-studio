import { Router } from 'express';
import * as authController from './controllers/authController';
import * as orderController from './controllers/orderController';
import * as adminController from './controllers/adminController';
import { authenticate, authorize } from './middleware/auth';

const router = Router();

// Auth
router.post('/auth/request-otp', authController.requestOtp);
router.post('/auth/verify-otp', authController.verifyOtp);

// Orders
router.post('/orders', authenticate, orderController.createOrder);
router.get('/orders', authenticate, orderController.getOrders);
router.patch('/orders/:id/status', authenticate, orderController.updateOrderStatus);

// Admin / CRM
router.get('/admin/dashboard', authenticate, authorize(['SUPER_ADMIN', 'CRM_ADMIN']), adminController.getDashboardStats);

export default router;
