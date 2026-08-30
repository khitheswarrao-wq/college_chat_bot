import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { documentService } from "../services/documentService";
import * as path from "path";

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded", code: "VALIDATION_ERROR" });
    }

    const { mimetype, size, originalname, path: filePath, filename } = req.file;

    // Validate file type
    if (!ALLOWED_TYPES[mimetype]) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type. Allowed: PDF, DOCX, TXT",
        code: "UNSUPPORTED_FILE_TYPE",
      });
    }

    // Validate file size
    if (size > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: "File too large. Max size is 20MB",
        code: "FILE_TOO_LARGE",
      });
    }

    const name = req.body.name || path.basename(originalname, path.extname(originalname));

    const doc = await documentService.createDocument({
      name,
      fileName: originalname,
      fileType: mimetype,
      fileSize: size,
      storagePath: filePath,
      uploadedBy: req.user!.id,
    });

    // Trigger async ingestion
    await documentService.triggerIngestion(doc.id);

    res.status(201).json({
      success: true,
      message: "Document uploaded and queued for processing",
      document: doc,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Upload failed", code: "SERVER_ERROR" });
  }
};

export const listDocuments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { docs, total } = await documentService.listDocuments(page, limit);
    res.json({ success: true, documents: docs, total, page, limit });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to list documents", code: "SERVER_ERROR" });
  }
};

export const getDocument = async (req: Request, res: Response) => {
  try {
    const doc = await documentService.getDocument(parseInt(req.params.id as string));
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found", code: "DOCUMENT_NOT_FOUND" });
    }
    res.json({ success: true, document: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", code: "SERVER_ERROR" });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    await documentService.deleteDocument(parseInt(req.params.id as string));
    res.json({ success: true, message: "Document deleted successfully" });
  } catch (error: any) {
    if (error.message === "Document not found") {
      return res.status(404).json({ success: false, message: error.message, code: "DOCUMENT_NOT_FOUND" });
    }
    res.status(500).json({ success: false, message: "Delete failed", code: "SERVER_ERROR" });
  }
};

export const reprocessDocument = async (req: AuthRequest, res: Response) => {
  try {
    await documentService.reprocessDocument(parseInt(req.params.id as string));
    res.json({ success: true, message: "Document reprocessing started" });
  } catch (error: any) {
    if (error.message === "Document not found") {
      return res.status(404).json({ success: false, message: error.message, code: "DOCUMENT_NOT_FOUND" });
    }
    res.status(500).json({ success: false, message: "Reprocess failed", code: "SERVER_ERROR" });
  }
};
