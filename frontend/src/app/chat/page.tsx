"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, Plus, Trash2, Send, LogOut, MessageCircle, ChevronRight,
  BookOpen, ThumbsUp, ThumbsDown, Loader2, AlertCircle, Shield, X, Menu
} from "lucide-react";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";
import ProtectedRoute from "../../components/ProtectedRoute";

interface Source { documentName: string; pageNumber: number; snippet: string; similarity: number; }
interface Message { id?: number; role: "user" | "assistant"; content: string; sources?: Source[]; }
interface Conversation { id: number; title: string; createdAt: string; updatedAt: string; }

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatContent />
    </ProtectedRoute>
  );
}

function ChatContent() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [convLoading, setConvLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [feedbackSent, setFeedbackSent] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadConversations = async () => {
    try {
      const { data } = await api.get("/conversations");
      setConversations(data.conversations || []);
    } catch {}
  };

  const loadConversation = async (id: number) => {
    setConvLoading(true);
    setSuggestedQuestions([]);
    try {
      const { data } = await api.get(`/conversations/${id}`);
      setActiveConvId(id);
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setConvLoading(false);
    }
  };

  const newConversation = () => {
    setActiveConvId(null);
    setMessages([]);
    setSuggestedQuestions([]);
  };

  const deleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConvId === id) newConversation();
    } catch {}
  };

  const sendMessage = async (questionText?: string) => {
    const question = (questionText || input).trim();
    if (!question || loading) return;
    setInput("");
    setSuggestedQuestions([]);

    const userMsg: Message = { role: "user", content: question };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await api.post("/chat", { question, conversationId: activeConvId });
      const assistantMsg: Message = {
        id: Date.now(),
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
      };
      setMessages(prev => [...prev, assistantMsg]);
      setSuggestedQuestions(data.suggestedQuestions || []);

      if (!activeConvId) {
        setActiveConvId(data.conversationId);
        await loadConversations();
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Something went wrong. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId: number, rating: "helpful" | "not_helpful") => {
    if (feedbackSent.has(messageId)) return;
    try {
      await api.post("/feedback", { messageId, rating });
      setFeedbackSent(prev => new Set([...prev, messageId]));
    } catch {}
  };

  const handleLogout = () => { logout(); router.push("/login"); };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Sidebar */}
      <aside className={`flex flex-col transition-all duration-300 border-r ${sidebarOpen ? "w-72" : "w-0 overflow-hidden"}`}
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        {/* Sidebar header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
              <Brain size={14} className="text-white" />
            </div>
            <span className="font-bold gradient-text">CollegeAI</span>
          </div>
          {user?.role === "admin" && (
            <button onClick={() => router.push("/admin")} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-secondary)" }} title="Admin">
              <Shield size={16} />
            </button>
          )}
        </div>

        {/* New chat button */}
        <div className="p-3">
          <button id="new-chat-btn" onClick={newConversation} className="btn-primary w-full flex items-center gap-2 justify-center py-2.5">
            <Plus size={16} /> New Chat
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageCircle size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No conversations yet. Start chatting!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map(conv => (
                <div key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${activeConvId === conv.id ? "border" : "hover:bg-[var(--surface-2)]"}`}
                  style={activeConvId === conv.id ? { background: "var(--primary-light)", borderColor: "var(--primary)", color: "var(--primary)" } : { color: "var(--text-secondary)" }}>
                  <MessageCircle size={14} className="flex-shrink-0" />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <button onClick={e => deleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User info */}
        <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "var(--surface-2)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{user?.name || user?.email}</div>
              <div className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{user?.role}</div>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg transition-colors hover:text-red-400" style={{ color: "var(--text-secondary)" }} title="Logout">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <button onClick={() => setSidebarOpen(v => !v)} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-secondary)" }}>
            <Menu size={18} />
          </button>
          <div>
            <h1 className="font-semibold text-sm">
              {activeConvId ? conversations.find(c => c.id === activeConvId)?.title || "Conversation" : "New Conversation"}
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Ask anything about your college</p>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {convLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={24} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : messages.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-20 animate-fadeInUp">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
                <Brain size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ask CollegeAI</h2>
              <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
                Get answers to your college questions from the official knowledge base.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {["What are the admission requirements for CSE?", "What is the fee structure for B.Tech?", "What documents are needed for admission?", "Tell me about hostel facilities"].map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="p-3 rounded-xl text-sm text-left transition-all hover:-translate-y-0.5 group"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                    <div className="flex items-start gap-2">
                      <ChevronRight size={14} className="mt-0.5 flex-shrink-0 group-hover:text-[var(--primary)] transition-colors" />
                      <span>{q}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 animate-fadeInUp ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${msg.role === "assistant" ? "text-white" : "text-white"}`}
                  style={{ background: msg.role === "assistant" ? "linear-gradient(135deg, var(--primary), var(--accent))" : "var(--surface-2)", border: "1px solid var(--border)" }}>
                  {msg.role === "assistant" ? <Brain size={14} /> : (user?.name?.[0]?.toUpperCase() || "U")}
                </div>

                <div className={`flex-1 max-w-3xl ${msg.role === "user" ? "items-end" : ""} flex flex-col gap-2`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "rounded-tr-sm ml-auto" : "rounded-tl-sm"}`}
                    style={msg.role === "user"
                      ? { background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "white", maxWidth: "80%" }
                      : { background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {/* Sources */}
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                        <BookOpen size={12} /> Sources
                      </div>
                      <div className="space-y-2">
                        {msg.sources.map((src, si) => (
                          <div key={si} className="p-3 rounded-xl text-xs" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{src.documentName}</span>
                              <div className="flex items-center gap-2">
                                <span className="badge badge-info">p.{src.pageNumber}</span>
                                <span className="badge badge-success">{src.similarity}% match</span>
                              </div>
                            </div>
                            <p className="italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>&ldquo;{src.snippet}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback buttons for assistant messages */}
                  {msg.role === "assistant" && msg.id && (
                    <div className="flex items-center gap-2">
                      {feedbackSent.has(msg.id) ? (
                        <span className="text-xs" style={{ color: "var(--success)" }}>Thanks for your feedback!</span>
                      ) : (
                        <>
                          <button onClick={() => handleFeedback(msg.id!, "helpful")} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors" style={{ color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                            <ThumbsUp size={11} /> Helpful
                          </button>
                          <button onClick={() => handleFeedback(msg.id!, "not_helpful")} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors" style={{ color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                            <ThumbsDown size={11} /> Not helpful
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3 animate-fadeInUp">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
                <Brain size={14} />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-1.5">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        {suggestedQuestions.length > 0 && !loading && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {suggestedQuestions.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full transition-all hover:-translate-y-0.5"
                style={{ background: "var(--primary-light)", border: "1px solid var(--primary)", color: "var(--primary)" }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="px-4 py-4 border-t" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div className="max-w-4xl mx-auto flex gap-3">
            <div className="flex-1 relative">
              <textarea
                id="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask about admissions, courses, fees, policies..."
                rows={1}
                className="input resize-none pr-12"
                style={{ minHeight: "44px", maxHeight: "160px" }}
              />
            </div>
            <button
              id="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="btn-primary px-4 flex-shrink-0 flex items-center justify-center"
              style={{ height: "44px" }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Answers are grounded in your college&apos;s official documents. Press Enter to send.
          </p>
        </div>
      </main>
    </div>
  );
}
