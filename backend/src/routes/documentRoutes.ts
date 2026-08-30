import { Router } from "express";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware";
import {
  uploadDocument,
  listDocuments,
  getDocument,
  deleteDocument,
  reprocessDocument,
} from "../controllers/documentController";

const UPLOADS_DIR = path.join(__dirname, "../../uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const router = Router();

router.post("/", authenticateToken, requireAdmin, upload.single("file"), uploadDocument);
router.get("/", authenticateToken, listDocuments);
router.get("/:id", authenticateToken, getDocument);
router.delete("/:id", authenticateToken, requireAdmin, deleteDocument);
router.post("/:id/reprocess", authenticateToken, requireAdmin, reprocessDocument);

export default router;
