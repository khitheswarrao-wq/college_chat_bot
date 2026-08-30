/**
 * Local embedding service using @xenova/transformers
 * Model: all-MiniLM-L6-v2 — 384-dimensional embeddings
 * Downloads ~80MB model on first use, then cached locally.
 * No API key required.
 */

let pipeline: any = null;
let modelLoading: Promise<any> | null = null;

async function getEmbeddingPipeline(): Promise<any> {
  if (pipeline) return pipeline;
  if (modelLoading) return modelLoading;

  modelLoading = (async () => {
    console.log("[Embeddings] Loading local embedding model (first run downloads ~80MB)...");
    // Dynamic import to avoid top-level ESM issues
    const { pipeline: createPipeline, env } = await import("@xenova/transformers");
    // Allow remote model downloads
    env.allowRemoteModels = true;
    pipeline = await createPipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("[Embeddings] Model loaded successfully.");
    return pipeline;
  })();

  return modelLoading;
}

/**
 * Generate a 384-dimensional embedding vector for text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const embed = await getEmbeddingPipeline();
  const output = await embed(text, { pooling: "mean", normalize: true });
  // output.data is a Float32Array
  return Array.from(output.data as Float32Array);
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  batchSize: number = 8
): Promise<number[][]> {
  const embed = await getEmbeddingPipeline();
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (text) => {
        const output = await embed(text, { pooling: "mean", normalize: true });
        return Array.from(output.data as Float32Array);
      })
    );
    embeddings.push(...results);
    if (i % 50 === 0 && i > 0) {
      console.log(`[Embeddings] Processed ${i}/${texts.length} chunks...`);
    }
  }

  return embeddings;
}
