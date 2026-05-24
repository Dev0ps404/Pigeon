import express from 'express';
import {
  uploadStory,
  getActiveStories,
  viewStory,
} from '../controllers/storyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(uploadStory)
  .get(getActiveStories);

router.route('/:storyId/view')
  .post(viewStory);

export default router;
