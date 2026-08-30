import { retrieve } from "./retriever";
import { buildContext, buildSystemPrompt, SourceReference } from "./contextBuilder";
import { generateAnswer, generateSuggestedQuestions } from "../ai/aiService";

export interface RagResult {
  answer: string;
  sources: SourceReference[];
  hasContext: boolean;
  suggestedQuestions: string[];
}

/**
 * Full RAG pipeline: retrieve → build context → generate answer
 */
export async function ragPipeline(
  question: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<RagResult> {
  // 1. Retrieve relevant chunks
  const chunks = await retrieve(question);

  // 2. Build context
  const { contextText, sources, hasContext } = buildContext(chunks);

  // 3. Build system prompt
  const systemPrompt = buildSystemPrompt(
    hasContext ? contextText : "No relevant information found in the knowledge base.",
    conversationHistory
  );

  // 4. Generate answer
  const answer = await generateAnswer({ systemPrompt, userMessage: question });

  // 5. Generate suggested questions (async, don't block)
  let suggestedQuestions: string[] = [];
  try {
    suggestedQuestions = await generateSuggestedQuestions(question, answer);
  } catch {
    // non-critical
  }

  return {
    answer,
    sources,
    hasContext,
    suggestedQuestions,
  };
}
