import express from "express";
import {
  getDashboardSales,
  getStockStatus,
} from "../controllers/dashboardController.js";
import requireAuth from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/sales", requireAuth, requireRole(["admin"]), getDashboardSales);

router.get("/stocks", requireAuth, requireRole(["admin"]), getStockStatus);

export default router;
