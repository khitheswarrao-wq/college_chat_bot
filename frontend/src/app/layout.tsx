import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CollegeAI — Smart College Assistant",
  description: "AI-powered college information assistant using Retrieval-Augmented Generation. Get instant, accurate answers about admissions, courses, fees, and more.",
  keywords: "college chatbot, AI assistant, RAG, college information, admissions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
