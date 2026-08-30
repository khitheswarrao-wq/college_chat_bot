import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { ragPipeline } from "../rag/ragPipeline";
import { Feedback } from "../models/Feedback";

export class ConversationService {
  async createConversation(userId: number, title: string = "New Conversation"): Promise<Conversation> {
    return Conversation.create({ userId, title });
  }

  async listConversations(userId: number): Promise<Conversation[]> {
    return Conversation.findAll({
      where: { userId },
      order: [["updatedAt", "DESC"]],
    });
  }

  async getConversation(id: number, userId: number): Promise<Conversation | null> {
    return Conversation.findOne({ where: { id, userId } });
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return Message.findAll({
      where: { conversationId },
      order: [["createdAt", "ASC"]],
    });
  }

  async deleteConversation(id: number, userId: number): Promise<void> {
    const conv = await Conversation.findOne({ where: { id, userId } });
    if (!conv) throw new Error("Conversation not found");
    await Message.destroy({ where: { conversationId: id } });
    await conv.destroy();
  }

  async chat(
    conversationId: number,
    userId: number,
    question: string
  ): Promise<{ answer: string; sources: any[]; suggestedQuestions: string[] }> {
    // Verify conversation belongs to user
    const conv = await Conversation.findOne({ where: { id: conversationId, userId } });
    if (!conv) throw new Error("Conversation not found");

    // Get conversation history
    const history = await Message.findAll({
      where: { conversationId },
      order: [["createdAt", "ASC"]],
      limit: 10,
    });

    const conversationHistory = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Save user message
    await Message.create({
      conversationId,
      role: "user",
      content: question,
    });

    // Update conversation title if it's the first message
    if (history.length === 0) {
      const title = question.length > 60 ? question.substring(0, 60) + "..." : question;
      await conv.update({ title });
    }

    // Run RAG pipeline
    const result = await ragPipeline(question, conversationHistory);

    // Save assistant message
    await Message.create({
      conversationId,
      role: "assistant",
      content: result.answer,
      sources: result.sources,
    });

    // Touch conversation updatedAt
    await conv.update({ updatedAt: new Date() });

    return {
      answer: result.answer,
      sources: result.sources,
      suggestedQuestions: result.suggestedQuestions,
    };
  }

  async submitFeedback(userId: number, messageId: number, rating: string, comment?: string): Promise<void> {
    await Feedback.create({ userId, messageId, rating, comment });
  }
}

export const conversationService = new ConversationService();
