import express from "express";
import {
  getSupplyHistory,
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

export default router;
