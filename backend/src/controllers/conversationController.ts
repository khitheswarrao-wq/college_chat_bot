import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { conversationService } from "../services/conversationService";

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const conv = await conversationService.createConversation(
      req.user!.id,
      req.body.title || "New Conversation"
    );
    res.status(201).json({ success: true, conversation: conv });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create conversation", code: "SERVER_ERROR" });
  }
};

export const listConversations = async (req: AuthRequest, res: Response) => {
  try {
    const convs = await conversationService.listConversations(req.user!.id);
    res.json({ success: true, conversations: convs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to list conversations", code: "SERVER_ERROR" });
  }
};

export const getConversationWithMessages = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const conv = await conversationService.getConversation(id, req.user!.id);
    if (!conv) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    const messages = await conversationService.getMessages(id);
    res.json({ success: true, conversation: conv, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", code: "SERVER_ERROR" });
  }
};

export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    await conversationService.deleteConversation(parseInt(req.params.id as string), req.user!.id);
    res.json({ success: true, message: "Conversation deleted" });
  } catch (error: any) {
    if (error.message === "Conversation not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Delete failed", code: "SERVER_ERROR" });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { question, conversationId } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: "Question is required", code: "VALIDATION_ERROR" });
    }

    let convId = conversationId;

    // Auto-create conversation if not provided
    if (!convId) {
      const conv = await conversationService.createConversation(req.user!.id);
      convId = conv.id;
    }

    const result = await conversationService.chat(convId, req.user!.id, question.trim());

    res.json({
      success: true,
      conversationId: convId,
      answer: result.answer,
      sources: result.sources,
      suggestedQuestions: result.suggestedQuestions,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    if (error.message === "Conversation not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Chat failed. Please try again.", code: "AI_SERVICE_ERROR" });
  }
};

export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId, rating, comment } = req.body;
    if (!messageId || !rating) {
      return res.status(400).json({ success: false, message: "messageId and rating required" });
    }
    await conversationService.submitFeedback(req.user!.id, messageId, rating, comment);
    res.json({ success: true, message: "Feedback submitted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to submit feedback", code: "SERVER_ERROR" });
  }
};
