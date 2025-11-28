import express from "express";
import {
  getItemsStockedSevenDays,
  getMoneySpentSevenDays,
  getSupplyHistory,
  getTotalMoneySpent,
  getLostMoneyStats,
  getTotalStock,
} from "../controllers/supplyHistoriesController.js";
import requireAuth from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getSupplyHistory
);
router.get(
  "/money-spent-seven-days",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getMoneySpentSevenDays
);

router.get(
  "/items-stocked-seven-days",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getItemsStockedSevenDays
);

router.get(
  "/total-money-spent",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getTotalMoneySpent
);

router.get(
  "/lost-money",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getLostMoneyStats
);

router.get(
  "/total-stock",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getTotalStock
);

export default router;
