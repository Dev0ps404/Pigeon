import express from 'express';
import {
  allMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  deleteMessageForMe,
  toggleReaction,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:chatId').get(protect, allMessages);
router.route('/').post(protect, sendMessage);
router.route('/:messageId').put(protect, editMessage).delete(protect, deleteMessage);
router.route('/:messageId/delete-me').post(protect, deleteMessageForMe);
router.route('/:messageId/react').post(protect, toggleReaction);

export default router;
