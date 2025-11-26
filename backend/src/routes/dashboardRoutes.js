import express from "express";
import {
  getDashboardSales,
  getStockStatus,
  getSupplyAndSalesComparison,
  getOverallSalesStats,
  getFastMovingProducts,
  getProductSalesMovement,
  getPendingReservationCount,
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
  "/sales/overall",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getOverallSalesStats
);

router.get(
  "/supply/fast-moving",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getFastMovingProducts
);

router.get(
  "/sales/product-movement",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getProductSalesMovement
);

router.get(
  "/reservations/pending-count",
  requireAuth,
  requireRole(["admin", "cashier", "staff"]),
  getPendingReservationCount
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
