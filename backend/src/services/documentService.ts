import * as fs from "fs";
import * as path from "path";
import { Document } from "../models/Document";
import { DocumentChunk } from "../models/DocumentChunk";
import { ingestDocument } from "../rag/ragIngestion";
import { deleteDocumentChunks } from "../rag/vectorStore";

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export class DocumentService {
  async createDocument(data: {
    name: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    storagePath: string;
    uploadedBy: number;
  }): Promise<Document> {
    const doc = await Document.create({
      ...data,
      status: "UPLOADED",
    });
    return doc;
  }

  async listDocuments(page = 1, limit = 20): Promise<{ docs: Document[]; total: number }> {
    const offset = (page - 1) * limit;
    const { count, rows } = await Document.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    return { docs: rows, total: count };
  }

  async getDocument(id: number): Promise<Document | null> {
    return Document.findByPk(id);
  }

  async deleteDocument(id: number): Promise<void> {
    const doc = await Document.findByPk(id);
    if (!doc) throw new Error("Document not found");

    // Delete the physical file
    if (fs.existsSync(doc.storagePath)) {
      fs.unlinkSync(doc.storagePath);
    }

    // Delete chunks (including embeddings)
    await deleteDocumentChunks(doc.id);
    await DocumentChunk.destroy({ where: { documentId: id } });

    await doc.destroy();
  }

  async reprocessDocument(id: number): Promise<void> {
    const doc = await Document.findByPk(id);
    if (!doc) throw new Error("Document not found");

    // Delete old chunks
    await deleteDocumentChunks(doc.id);
    await DocumentChunk.destroy({ where: { documentId: id } });

    // Reset status
    await doc.update({ status: "UPLOADED", processingError: null, chunkCount: 0 });

    // Trigger ingestion asynchronously
    ingestDocument(doc.id).catch((err) => {
      console.error(`Reprocess failed for document ${id}:`, err);
    });
  }

  async triggerIngestion(documentId: number): Promise<void> {
    // Run ingestion asynchronously
    ingestDocument(documentId).catch((err) => {
      console.error(`Ingestion failed for document ${documentId}:`, err);
    });
  }

  async getDashboardStats() {
    const total = await Document.count();
    const processed = await Document.count({ where: { status: "PROCESSED" } });
    const failed = await Document.count({ where: { status: "FAILED" } });
    const processing = await Document.count({ where: { status: "PROCESSING" } });
    const totalChunks = await DocumentChunk.count();

    return { total, processed, failed, processing, totalChunks };
  }
}

export const documentService = new DocumentService();
