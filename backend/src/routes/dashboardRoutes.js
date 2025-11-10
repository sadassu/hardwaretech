import express from "express";
import {
  getDashboardSales,
  getStockStatus,
  getSupplyAndSalesComparison,
} from "../controllers/dashboardController.js";
import requireAuth from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get(
  "/sales",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getDashboardSales
);

router.get(
  "/stocks",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getStockStatus
);

router.get(
  "/supply-sales",
  requireAuth,
  requireRole(["admin"]),
  getSupplyAndSalesComparison
);
export default router;
