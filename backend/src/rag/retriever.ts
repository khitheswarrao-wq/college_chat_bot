import { generateEmbedding } from "./embeddingService";
import { similaritySearch, StoredChunk } from "./vectorStore";

const TOP_K = 6;
const SIMILARITY_THRESHOLD = 0.35;

/**
 * Retrieve the most relevant chunks for a user question
 */
export async function retrieve(question: string): Promise<StoredChunk[]> {
  const queryEmbedding = await generateEmbedding(question);
  const results = await similaritySearch(queryEmbedding, TOP_K, SIMILARITY_THRESHOLD);
  return results;
}
