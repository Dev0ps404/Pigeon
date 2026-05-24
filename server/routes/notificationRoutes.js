import express from 'express';
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotifications);

router.route('/:notificationId/read')
  .put(markNotificationRead);

router.route('/:notificationId')
  .delete(deleteNotification);

export default router;
