import express from 'express';
import {
  sendFriendRequest,
  respondToFriendRequest,
  getFriends,
  getPendingRequests,
  removeFriend,
} from '../controllers/friendController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getFriends);

router.route('/request')
  .post(sendFriendRequest);

router.route('/pending')
  .get(getPendingRequests);

router.route('/respond/:requestId')
  .put(respondToFriendRequest);

router.route('/:friendId')
  .delete(removeFriend);

export default router;
