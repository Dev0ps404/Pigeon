import express from 'express';
import { getSmartSuggestions, summarizeChat } from '../controllers/aiController.js';
import { protect as authProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authProtect);

router.post('/suggest', getSmartSuggestions);
router.post('/summarize', summarizeChat);

export default router;
