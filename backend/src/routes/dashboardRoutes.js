import express from "express";
import {
  getDashboardSales,
  getStockStatus,
} from "../controllers/dashboardController.js";
import requireAuth from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get(
  "/sales",
  requireAuth,
  requireRole(["admin", "manager"]),
  getDashboardSales
);

router.get(
  "/stocks",
  requireAuth,
  requireRole(["admin", "manager"]),
  getStockStatus
);

export default router;
