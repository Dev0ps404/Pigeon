import express from 'express';
import { getAdminMetrics, getAllUsers, toggleBanUser } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to ensure admin (we can protect it first, and in production we check user.role or verified)
router.use(protect);

router.get('/metrics', getAdminMetrics);
router.get('/users', getAllUsers);
router.put('/users/:userId/ban', toggleBanUser);

export default router;
