"use client";

import Link from "next/link";
import { BookOpen, Brain, Shield, Zap, Search, MessageCircle, ChevronRight, Star, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
                <Brain size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg gradient-text">CollegeAI</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
              <Link href="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "var(--primary)" }} />
        <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl" style={{ background: "var(--accent)" }} />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border" style={{ background: "var(--primary-light)", borderColor: "var(--primary)", color: "var(--primary)" }}>
            <Zap size={12} /> Powered by Google Gemini &amp; pgvector RAG
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Your College<br />
            <span className="gradient-text">AI Assistant</span>
          </h1>

          <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: "var(--text-secondary)" }}>
            Ask any question about admissions, courses, fees, or policies. Get instant, accurate answers grounded in your college&apos;s official documents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
              Start Chatting <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3">
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { label: "RAG Pipeline", value: "Real" },
              { label: "Response Time", value: "~2s" },
              { label: "Document Types", value: "PDF, DOCX, TXT" },
            ].map((stat) => (
              <div key={stat.label} className="card text-center">
                <div className="font-bold text-lg gradient-text">{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4" style={{ background: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p style={{ color: "var(--text-secondary)" }}>A genuine RAG pipeline — not just an LLM chatbot</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: <BookOpen size={20} />, step: "01", title: "Upload Documents", desc: "Admins upload college PDFs, handbooks, and policies" },
              { icon: <Brain size={20} />, step: "02", title: "AI Processing", desc: "Text extracted, chunked, and embedded into vectors" },
              { icon: <Search size={20} />, step: "03", title: "Semantic Search", desc: "Your question retrieves the most relevant chunks" },
              { icon: <MessageCircle size={20} />, step: "04", title: "Grounded Answer", desc: "Gemini generates an answer from retrieved context" },
            ].map((item) => (
              <div key={item.step} className="card relative group hover:border-[var(--primary)] transition-colors">
                <div className="text-4xl font-black mb-3 opacity-10" style={{ color: "var(--primary)" }}>{item.step}</div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything you need</h2>
            <p style={{ color: "var(--text-secondary)" }}>Built for colleges, designed for students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Shield size={22} />, title: "Source Attribution", desc: "Every answer shows exactly which document and page it came from. No fabrication." },
              { icon: <Brain size={22} />, title: "Context-Aware Chat", desc: "Follow-up questions use conversation history for coherent multi-turn dialogue." },
              { icon: <Star size={22} />, title: "Suggested Questions", desc: "AI-generated follow-up questions to help students explore further." },
              { icon: <Zap size={22} />, title: "Real-time Processing", desc: "Upload a document and it's searchable within seconds via vector indexing." },
              { icon: <BookOpen size={22} />, title: "Multi-format Support", desc: "PDF, DOCX, and TXT documents are all supported with text extraction." },
              { icon: <MessageCircle size={22} />, title: "Conversation History", desc: "All conversations are saved and accessible anytime for reference." },
            ].map((feat) => (
              <div key={feat.title} className="card hover:border-[var(--primary)] transition-colors group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                  {feat.icon}
                </div>
                <h3 className="font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4" style={{ background: "var(--surface)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="mb-8 text-lg" style={{ color: "var(--text-secondary)" }}>
            Register as a student to ask questions, or sign in as an admin to upload college documents.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
              Create Account <ChevronRight size={16} />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3">
              Already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
              <Brain size={12} className="text-white" />
            </div>
            <span className="font-semibold text-sm">CollegeAI</span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            RAG-Based College Chatbot — Powered by Google Gemini &amp; pgvector
          </p>
        </div>
      </footer>
    </div>
  );
}
