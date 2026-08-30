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

/**
 * Ensure pgvector extension and chunks table with embedding column exist
 */
export async function initVectorStore(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("CREATE EXTENSION IF NOT EXISTS vector;");

    // Check current embedding column dimension (if it exists)
    const colCheck = await client.query(`
      SELECT atttypmod FROM pg_attribute
      JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
      WHERE pg_class.relname = 'document_chunks'
        AND pg_attribute.attname = 'embedding'
        AND NOT pg_attribute.attisdropped;
    `);

    if (colCheck.rows.length > 0) {
      // Column exists — check if dimension is wrong (768 vs 384)
      // atttypmod for vector(N) = N + 4 (internal pg encoding)
      const dim = colCheck.rows[0].atttypmod - 4;
      if (dim !== 384) {
        console.log(`[VectorStore] Migrating embedding column from dim ${dim} → 384...`);
        await client.query("ALTER TABLE document_chunks DROP COLUMN embedding;");
        await client.query("ALTER TABLE document_chunks ADD COLUMN embedding vector(384);");
        console.log("[VectorStore] Migration complete. Re-upload documents to regenerate embeddings.");
      }
    } else {
      // Column does not exist yet — create it
      await client.query(`
        ALTER TABLE document_chunks
        ADD COLUMN IF NOT EXISTS embedding vector(384);
      `);
    }

    // Create index for faster similarity search
    await client.query(`
      CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
      ON document_chunks USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `).catch(() => {
      // Index creation may fail if table is empty; that's OK
    });

    console.log("Vector store initialized successfully.");
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
}

/**
 * Delete all chunks for a document
 */
export async function deleteDocumentChunks(documentId: number): Promise<void> {
  await pool.query("DELETE FROM document_chunks WHERE \"documentId\" = $1", [documentId]);
}
