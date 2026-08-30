import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const LLM_MODEL = "qwen/qwen3.8-27b";

let client: Groq | null = null;

function getClient(): Groq {
  if (!client) {
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured in .env");
    }
    client = new Groq({ apiKey: GROQ_API_KEY });
  }
  return client;
}

export interface GenerateOptions {
  systemPrompt: string;
  userMessage: string;
}

/**
 * Generate an answer from Groq LLM
 */
export async function generateAnswer(options: GenerateOptions): Promise<string> {
  const groq = getClient();

  const completion = await groq.chat.completions.create({
    model: LLM_MODEL,
    messages: [
      { role: "system", content: options.systemPrompt },
      { role: "user", content: options.userMessage },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || "No response generated.";
}

/**
 * Generate suggested follow-up questions
 */
export async function generateSuggestedQuestions(
  question: string,
  answer: string
): Promise<string[]> {
  try {
    const groq = getClient();
    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b", // faster model for suggestions
      messages: [
        {
          role: "user",
          content: `Based on this college chatbot Q&A, generate 3 relevant follow-up questions a student might ask.

Question: ${question}
Answer: ${answer.substring(0, 400)}

Return ONLY a JSON array of 3 question strings. Example: ["Q1?", "Q2?", "Q3?"]`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const questions = JSON.parse(match[0]);
      return Array.isArray(questions) ? questions.slice(0, 3) : [];
    }
    return [];
  } catch {
    return [];
  }
}
