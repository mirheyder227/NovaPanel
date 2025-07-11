// server/routes/admin.js
import express from 'express';
import { getDashboardStats, getRecentActivities } from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin paneli statistikalarını gətirmək
router.get(
    '/dashboard-stats',
    authenticateToken,
    authorizeRoles('admin'),
    getDashboardStats
);

// Admin paneli son fəaliyyətləri gətirmək
router.get(
    '/recent-activities',
    authenticateToken,
    authorizeRoles('admin'),
    getRecentActivities
);

export default router;