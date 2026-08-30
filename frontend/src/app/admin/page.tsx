"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain, FileText, CheckCircle, XCircle, Clock, MessageCircle, HelpCircle, LogOut, Upload, ChevronRight, Loader2 } from "lucide-react";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";
import ProtectedRoute from "../../components/ProtectedRoute";

interface Stats {
  total: number; processed: number; failed: number; processing: number;
  totalChunks: number; totalConversations: number; totalQuestions: number;
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await api.get("/admin/dashboard");
      setStats(data.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); router.push("/login"); };

  const statCards = stats ? [
    { icon: <FileText size={20} />, label: "Total Documents", value: stats.total, color: "info" },
    { icon: <CheckCircle size={20} />, label: "Processed", value: stats.processed, color: "success" },
    { icon: <XCircle size={20} />, label: "Failed", value: stats.failed, color: "danger" },
    { icon: <Clock size={20} />, label: "Processing", value: stats.processing, color: "warning" },
    { icon: <HelpCircle size={20} />, label: "Total Chunks", value: stats.totalChunks, color: "info" },
    { icon: <MessageCircle size={20} />, label: "Conversations", value: stats.totalConversations, color: "info" },
    { icon: <MessageCircle size={20} />, label: "Questions Asked", value: stats.totalQuestions, color: "info" },
  ] : [];

  const colorMap: Record<string, string> = {
    info: "var(--primary)", success: "var(--success)", danger: "var(--danger)", warning: "var(--warning)"
  };
  const bgMap: Record<string, string> = {
    info: "rgba(99,102,241,0.12)", success: "rgba(16,185,129,0.12)", danger: "rgba(239,68,68,0.12)", warning: "rgba(245,158,11,0.12)"
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Top nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-bold gradient-text">CollegeAI</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{user?.name || user?.email}</span>
          <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-2 py-2 px-3">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
          <p style={{ color: "var(--text-secondary)" }}>Manage your college knowledge base</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button onClick={() => router.push("/admin/documents")}
            className="card flex items-center gap-4 hover:border-[var(--primary)] transition-colors text-left group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
              <Upload size={22} />
            </div>
            <div className="flex-1">
              <div className="font-semibold mb-0.5">Manage Documents</div>
              <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Upload, delete, and reprocess knowledge base documents</div>
            </div>
            <ChevronRight size={18} style={{ color: "var(--text-muted)" }} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button onClick={() => router.push("/chat")}
            className="card flex items-center gap-4 hover:border-[var(--primary)] transition-colors text-left group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.12)", color: "var(--success)" }}>
              <MessageCircle size={22} />
            </div>
            <div className="flex-1">
              <div className="font-semibold mb-0.5">Test Chat</div>
              <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Test the RAG chatbot with student questions</div>
            </div>
            <ChevronRight size={18} style={{ color: "var(--text-muted)" }} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Stats grid */}
        <h2 className="text-lg font-semibold mb-4">System Overview</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--primary)" }} />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: bgMap[card.color], color: colorMap[card.color] }}>
                    {card.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{card.value.toLocaleString()}</div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{card.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
