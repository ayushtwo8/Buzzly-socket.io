import { Router } from 'express'
import { protectRoute } from '../middlewares/authMiddlware.js';
import { searchUsers } from '../controllers/userController.js';

const router = Router();

router.get('/search', protectRoute, searchUsers);

export default router;