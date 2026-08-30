import { StoredChunk } from "./vectorStore";

export interface BuiltContext {
  contextText: string;
  sources: SourceReference[];
  hasContext: boolean;
}

export interface SourceReference {
  documentName: string;
  pageNumber: number;
  snippet: string;
  similarity: number;
}

/**
 * Build the context string and source references from retrieved chunks
 */
export function buildContext(chunks: StoredChunk[]): BuiltContext {
  if (!chunks || chunks.length === 0) {
    return { contextText: "", sources: [], hasContext: false };
  }

  const sources: SourceReference[] = chunks.map((chunk) => ({
    documentName: chunk.documentName,
    pageNumber: chunk.pageNumber,
    snippet: chunk.text.substring(0, 300) + (chunk.text.length > 300 ? "..." : ""),
    similarity: Math.round(chunk.similarity * 100),
  }));

  // De-duplicate source documents
  const seenDocs = new Set<string>();
  const uniqueSources = sources.filter((s) => {
    const key = `${s.documentName}-${s.pageNumber}`;
    if (seenDocs.has(key)) return false;
    seenDocs.add(key);
    return true;
  });

  // Build the context text
  const contextParts = chunks.map((chunk, i) => {
    return `[Source ${i + 1}: ${chunk.documentName}, Page ${chunk.pageNumber}]\n${chunk.text}`;
  });

  const contextText = contextParts.join("\n\n---\n\n");

  return {
    contextText,
    sources: uniqueSources,
    hasContext: true,
  };
}

/**
 * Build the full system prompt for the LLM
 */
export function buildSystemPrompt(contextText: string, conversationHistory: { role: string; content: string }[]): string {
  const historyText = conversationHistory
    .slice(-6) // last 3 turns
    .map((m) => `${m.role === "user" ? "Student" : "Assistant"}: ${m.content}`)
    .join("\n");

  return `You are CollegeAI, an intelligent assistant for college students. You answer questions ONLY based on the college knowledge base provided below.

IMPORTANT RULES:
- Answer ONLY from the provided college knowledge context below.
- If the context does not contain the answer, clearly state: "I couldn't find reliable information about this in the college knowledge base."
- Do NOT fabricate fees, dates, rules, policies, admission requirements, faculty details, or any other college information.
- Cite which documents your answer comes from when relevant.
- Be concise, helpful, and professional.

${conversationHistory.length > 0 ? `CONVERSATION HISTORY:\n${historyText}\n\n` : ""}COLLEGE KNOWLEDGE CONTEXT:
${contextText}`;
}
