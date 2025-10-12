import express from "express";
import {
  deleteAllProducts,
  deleteAllResrvations,
  deleteAllSales,
  deleteAllSupplyHistory,
} from "../controllers/deleteController.js";
import { requireRole } from "../middleware/requireRole.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.delete(
  "/products",
  requireAuth,
  requireRole("admin"),
  deleteAllProducts
);
router.delete(
  "/reservations",
  requireAuth,
  requireRole("admin"),
  deleteAllResrvations
);
router.delete(
  "/sales",
  requireAuth,
  requireRole("admin"),
  deleteAllSales
);
router.delete(
  "/supply-histories",
  requireAuth,
  requireRole("admin"),
  deleteAllSupplyHistory
);
export default router;
