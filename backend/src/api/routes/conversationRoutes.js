import { Router } from 'express'
import { protectRoute } from '../middlewares/authMiddlware.js';
import { getMessages, getUserConversations } from '../controllers/conversationController.js';

const router = Router();

router.get('/', protectRoute, getUserConversations);
router.get('/:conversationId/messages', protectRoute, getMessages);

export default router;