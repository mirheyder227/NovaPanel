// server/routes/admin.js
import express from 'express';
import { getDashboardStats, getRecentActivities } from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
    '/dashboard-stats',
    authenticateToken,
    authorizeRoles('admin'),
    getDashboardStats
);

router.get(
    '/recent-activities',
    authenticateToken,
    authorizeRoles('admin'),
    getRecentActivities
);

export default router;