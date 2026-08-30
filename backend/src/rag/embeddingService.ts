/**
 * Local embedding service using @xenova/transformers
 * Model: all-MiniLM-L6-v2 — 384-dimensional embeddings
 * Downloads ~80MB model on first use, then cached locally.
 * No API key required.
 */

import * as path from "path";
import * as os from "os";

let pipeline: any = null;
let modelLoading: Promise<any> | null = null;

const dynamicImport = new Function("specifier", "return import(specifier)");

async function getEmbeddingPipeline(): Promise<any> {
  if (pipeline) return pipeline;
  if (modelLoading) return modelLoading;

  modelLoading = (async () => {
    console.log("[Embeddings] Loading local embedding model...");
    // Use dynamic function import to prevent TypeScript CommonJS from converting import() to require()
    const { pipeline: createPipeline, env } = await dynamicImport("@xenova/transformers");
    env.allowRemoteModels = true;
    env.useBrowserCache = false;
    env.cacheDir = path.join(os.tmpdir(), "xenova-cache");

    pipeline = await createPipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      quantized: true,
    });
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
  return Array.from(output.data as Float32Array);
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  batchSize: number = 4
): Promise<number[][]> {
  const embed = await getEmbeddingPipeline();
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    for (const text of batch) {
      const output = await embed(text, { pooling: "mean", normalize: true });
      embeddings.push(Array.from(output.data as Float32Array));
    }
    if (i % 20 === 0 && i > 0) {
      console.log(`[Embeddings] Processed ${i}/${texts.length} chunks...`);
    }
  }

  return embeddings;
}
