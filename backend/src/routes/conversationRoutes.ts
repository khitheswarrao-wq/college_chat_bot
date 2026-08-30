import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  createConversation,
  listConversations,
  getConversationWithMessages,
  deleteConversation,
  sendMessage,
  submitFeedback,
} from "../controllers/conversationController";

const router = Router();

// Chat endpoint
router.post("/chat", authenticateToken, sendMessage);

// Conversation endpoints
router.post("/conversations", authenticateToken, createConversation);
router.get("/conversations", authenticateToken, listConversations);
router.get("/conversations/:id", authenticateToken, getConversationWithMessages);
router.delete("/conversations/:id", authenticateToken, deleteConversation);

// Feedback
router.post("/feedback", authenticateToken, submitFeedback);

export default router;
