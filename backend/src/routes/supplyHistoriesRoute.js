import express from "express";
import {
  getItemsStockedSevenDays,
  getMoneySpentSevenDays,
  getSupplyHistory,
  getTotalMoneySpent,
  redoSupplyHistory,
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
router.post(
  "/:id/redo",
  requireAuth,
  requireRole(["admin", "cashier"]),
  redoSupplyHistory
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

export default router;
