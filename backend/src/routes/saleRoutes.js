import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import { createSale, getSales } from "../controllers/saleController.js";
import { requireRole } from "../middleware/requireRole.js";
const router = express.Router();

router.post("/", requireAuth, requireRole(["admin", "cashier"]), createSale);

router.get("/", requireAuth, requireRole(["admin", "cashier"]), getSales);

export default router;
