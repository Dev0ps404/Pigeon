import express from 'express';
import { logCall, getCallHistory } from '../controllers/callController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(logCall)
  .get(getCallHistory);

export default router;
