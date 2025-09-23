import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import { createSale } from "../controllers/saleController.js";
import { requireRole } from "../middleware/requireRole.js";
const router = express.Router();

router.post("/", requireAuth, requireRole(["admin", "manager"]), createSale);
export default router;
