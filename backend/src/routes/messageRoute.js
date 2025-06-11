import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getMessages, getUsersForSidebar, sendMessages } from "../controllers/messageController.js";

const messageRouter = Router();

messageRouter.get("/users", authenticate, getUsersForSidebar);
messageRouter.get("/:id", authenticate, getMessages);
messageRouter.post("/send/:id", authenticate, sendMessages);

export default messageRouter;