import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import {
  createSale,
  getAnnualSales,
  getDailySales,
  getSales,
  getThisYearSales,
  getMonthlySales,
  exportSales,
} from "../controllers/saleController.js";
import { requireRole } from "../middleware/requireRole.js";
import { returnSales } from "../controllers/saleReturnController.js";
const router = express.Router();

router.post("/", requireAuth, requireRole(["admin", "cashier"]), createSale);

router.get("/", requireAuth, requireRole(["admin", "cashier"]), getSales);

router.get(
  "/export",
  requireAuth,
  requireRole(["admin", "cashier"]),
  exportSales
);

router.get(
  "/daily-sales",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getDailySales
);

router.get(
  "/annual-sales",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getAnnualSales
);

router.get(
  "/this-year-sales",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getThisYearSales
);

router.get(
  "/monthly-sales",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getMonthlySales
);

router.post(
  "/return/:saleId",
  requireAuth,
  requireRole(["admin", "cashier"]),
  returnSales
);

export default router;
