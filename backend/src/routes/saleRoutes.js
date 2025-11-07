import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import {
  createSale,
  getAnnualSales,
  getDailySales,
  getSales,
  getThisYearSales,
  getMonthlySales, // <-- add import
} from "../controllers/saleController.js";
import { requireRole } from "../middleware/requireRole.js";
const router = express.Router();

router.post("/", requireAuth, requireRole(["admin", "cashier"]), createSale);

router.get("/", requireAuth, requireRole(["admin", "cashier"]), getSales);

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

export default router;
