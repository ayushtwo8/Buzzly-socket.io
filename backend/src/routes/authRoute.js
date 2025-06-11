import { Router } from 'express';
import { signup, login, logout, updateProfile, checkAuth } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.put("/update-profile", authenticate, updateProfile);
authRouter.get("/check", authenticate, checkAuth);


export default authRouter;