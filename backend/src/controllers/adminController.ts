import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { documentService } from "../services/documentService";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { Document } from "../models/Document";

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const docStats = await documentService.getDashboardStats();
    const totalConversations = await Conversation.count();
    const totalMessages = await Message.count({ where: { role: "user" } });

    res.json({
      success: true,
      stats: {
        ...docStats,
        totalConversations,
        totalQuestions: totalMessages,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get dashboard stats", code: "SERVER_ERROR" });
  }
};

export const getAdminDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const { docs, total } = await documentService.listDocuments(page, limit);
    res.json({ success: true, documents: docs, total });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", code: "SERVER_ERROR" });
  }
};
