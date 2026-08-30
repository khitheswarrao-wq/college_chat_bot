import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware";
import { getDashboard, getAdminDocuments } from "../controllers/adminController";

const router = Router();

router.get("/dashboard", authenticateToken, requireAdmin, getDashboard);
router.get("/documents", authenticateToken, requireAdmin, getAdminDocuments);

export default router;
