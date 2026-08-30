import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Use same connection as Sequelize but raw pg for vector operations
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "collegeai",
      ssl:
        process.env.DB_SSL === "true" ||
        process.env.DB_HOST?.includes("supabase") ||
        process.env.DB_HOST?.includes("render")
          ? { rejectUnauthorized: false }
          : false,
    };

const pool = new Pool(poolConfig);


export interface StoredChunk {
  id: number;
  documentId: number;
  documentName: string;
  chunkIndex: number;
  text: string;
  pageNumber: number;
  similarity: number;
}

let hasPgVector = false;

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Ensure pgvector extension or fallback embedding column exists
 */
export async function initVectorStore(): Promise<void> {
  const client = await pool.connect();
  try {
    try {
      await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
      hasPgVector = true;
    } catch (extErr) {
      console.warn("[VectorStore] pgvector extension not available on this DB; using universal fallback.");
      hasPgVector = false;
    }

    if (hasPgVector) {
      const colCheck = await client.query(`
        SELECT atttypmod FROM pg_attribute
        JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
        WHERE pg_class.relname = 'document_chunks'
          AND pg_attribute.attname = 'embedding'
          AND NOT pg_attribute.attisdropped;
      `);

      if (colCheck.rows.length > 0) {
        const dim = colCheck.rows[0].atttypmod - 4;
        if (dim !== 384 && dim > 0) {
          console.log(`[VectorStore] Migrating embedding column from dim ${dim} → 384...`);
          await client.query("ALTER TABLE document_chunks DROP COLUMN IF EXISTS embedding;");
          await client.query("ALTER TABLE document_chunks ADD COLUMN embedding vector(384);");
        }
      } else {
        await client.query(`
          ALTER TABLE document_chunks
          ADD COLUMN IF NOT EXISTS embedding vector(384);
        `);
      }

      await client.query(`
        CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
        ON document_chunks USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
      `).catch(() => {});
    } else {
      // Fallback: Add embedding as TEXT column if not exists
      await client.query(`
        ALTER TABLE document_chunks
        ADD COLUMN IF NOT EXISTS embedding TEXT;
      `).catch(() => {});
    }

    console.log(`Vector store initialized successfully (pgvector: ${hasPgVector}).`);
  } catch (err: any) {
    console.error("[VectorStore] Init notice:", err.message);
  } finally {
    client.release();
  }
}

/**
 * Store a chunk embedding in the vector database
 */
export async function storeChunkEmbedding(
  chunkId: number,
  embedding: number[]
): Promise<void> {
  const vectorStr = `[${embedding.join(",")}]`;
  await pool.query(
    "UPDATE document_chunks SET embedding = $1 WHERE id = $2",
    [vectorStr, chunkId]
  );
}

/**
 * Search for the most similar chunks to a query embedding
 */
export async function similaritySearch(
  queryEmbedding: number[],
  topK: number = 5,
  similarityThreshold: number = 0.4
): Promise<StoredChunk[]> {
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  if (hasPgVector) {
    try {
      const result = await pool.query(
        `
        SELECT 
          dc.id,
          dc."documentId",
          d.name as "documentName",
          dc."chunkIndex",
          dc.text,
          dc."pageNumber",
          1 - (dc.embedding <=> $1::vector) AS similarity
        FROM document_chunks dc
        JOIN documents d ON dc."documentId" = d.id
        WHERE dc.embedding IS NOT NULL
          AND 1 - (dc.embedding <=> $1::vector) > $2
        ORDER BY dc.embedding <=> $1::vector
        LIMIT $3
        `,
        [vectorStr, similarityThreshold, topK]
      );

      return result.rows.map((row: Record<string, any>) => ({
        id: row.id,
        documentId: row.documentId,
        documentName: row.documentName,
        chunkIndex: row.chunkIndex,
        text: row.text,
        pageNumber: row.pageNumber,
        similarity: parseFloat(row.similarity),
      }));
    } catch (pgvErr) {
      console.warn("[VectorStore] Native vector search fallback to in-memory:", pgvErr);
      hasPgVector = false;
    }
  }

  // Universal Fallback: Fetch chunks and calculate cosine similarity in JS
  const result = await pool.query(
    `
    SELECT 
      dc.id,
      dc."documentId",
      d.name as "documentName",
      dc."chunkIndex",
      dc.text,
      dc."pageNumber",
      dc.embedding
    FROM document_chunks dc
    JOIN documents d ON dc."documentId" = d.id
    WHERE dc.embedding IS NOT NULL
    LIMIT 2000
    `
  );

  const scored: StoredChunk[] = [];
  for (const row of result.rows) {
    try {
      const rawEmb = typeof row.embedding === "string" 
        ? JSON.parse(row.embedding.replace(/\[/g, "[").replace(/\]/g, "]"))
        : row.embedding;
      if (Array.isArray(rawEmb)) {
        const sim = cosineSimilarity(queryEmbedding, rawEmb);
        if (sim >= similarityThreshold) {
          scored.push({
            id: row.id,
            documentId: row.documentId,
            documentName: row.documentName,
            chunkIndex: row.chunkIndex,
            text: row.text,
            pageNumber: row.pageNumber,
            similarity: sim,
          });
        }
      }
    } catch {}
  }

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
}

/**
 * Delete all chunks for a document
 */
export async function deleteDocumentChunks(documentId: number): Promise<void> {
  await pool.query("DELETE FROM document_chunks WHERE \"documentId\" = $1", [documentId]);
}

