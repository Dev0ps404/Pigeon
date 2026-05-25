import express from 'express';
import {
  allMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  deleteMessageForMe,
  toggleReaction,
  markChatAsRead,
  markMessageAsDelivered,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:chatId').get(protect, allMessages);
router.route('/').post(protect, sendMessage);
router.route('/:chatId/read').post(protect, markChatAsRead);
router.route('/:messageId/deliver').post(protect, markMessageAsDelivered);
router.route('/:messageId').put(protect, editMessage).delete(protect, deleteMessage);
router.route('/:messageId/delete-me').post(protect, deleteMessageForMe);
router.route('/:messageId/react').post(protect, toggleReaction);

export default router;
