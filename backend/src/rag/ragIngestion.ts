import * as fs from "fs";
import * as path from "path";
import { Document } from "../models/Document";
import { DocumentChunk } from "../models/DocumentChunk";
import { extractText } from "./textExtractor";
import { cleanText } from "./textCleaner";
import { chunkPages } from "./chunker";
import { generateEmbeddingsBatch } from "./embeddingService";
import { storeChunkEmbedding } from "./vectorStore";

/**
 * Full RAG ingestion pipeline for a document
 * Runs asynchronously after upload
 */
export async function ingestDocument(documentId: number): Promise<void> {
  const doc = await Document.findByPk(documentId);
  if (!doc) {
    console.error(`Document ${documentId} not found`);
    return;
  }

  try {
    // Mark as PROCESSING
    await doc.update({ status: "PROCESSING" });

    console.log(`[Ingestion] Starting: ${doc.name} (id=${documentId})`);

    // 0. Verify file exists on disk
    let targetFilePath = doc.storagePath;
    if (!fs.existsSync(targetFilePath)) {
      const altPath = path.join(process.cwd(), "uploads", path.basename(doc.storagePath));
      if (fs.existsSync(altPath)) {
        targetFilePath = altPath;
      } else {
        await doc.update({
          status: "FAILED",
          processingError: "Original file is no longer on server disk (server restarted). Please upload this document again.",
        });
        return;
      }
    }

    // 1. Extract text
    const extracted = await extractText(targetFilePath, doc.fileType);
    console.log(`[Ingestion] Extracted ${extracted.totalPages} pages`);

    // 2. Clean text per page
    const cleanedPages = extracted.pages.map((page) => ({
      ...page,
      text: cleanText(page.text),
    })).filter((p) => p.text.length > 0);

    // 3. Chunk
    const chunks = chunkPages(cleanedPages, documentId, doc.name);
    console.log(`[Ingestion] Created ${chunks.length} chunks`);

    if (chunks.length === 0) {
      await doc.update({ status: "FAILED", processingError: "No text could be extracted from document" });
      return;
    }

    // 4. Save chunks to DB
    const savedChunks = await DocumentChunk.bulkCreate(
      chunks.map((c) => ({
        documentId: c.documentId,
        chunkIndex: c.chunkIndex,
        text: c.text,
        pageNumber: c.pageNumber,
        metadata: { documentName: c.documentName },
      }))
    );

    // 5. Generate embeddings in batch
    const texts = chunks.map((c) => c.text);
    const embeddings = await generateEmbeddingsBatch(texts);
    console.log(`[Ingestion] Generated ${embeddings.length} embeddings`);

    // 6. Store embeddings in vector store
    for (let i = 0; i < savedChunks.length; i++) {
      await storeChunkEmbedding(savedChunks[i].id, embeddings[i]);
    }

    // 7. Mark as PROCESSED
    await doc.update({
      status: "PROCESSED",
      pageCount: extracted.totalPages,
      chunkCount: chunks.length,
      processingError: null,
    });

    console.log(`[Ingestion] Completed: ${doc.name}`);
  } catch (error: any) {
    console.error(`[Ingestion] Failed for document ${documentId}:`, error.message);
    await doc.update({
      status: "FAILED",
      processingError: error.message || "Unknown error during processing",
    });
  }
}
