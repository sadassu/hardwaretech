import express from "express";
import {
  deleteAllProducts,
  deleteAllResrvations,
  deleteAllSales,
} from "../controllers/deleteController.js";
import { requireRole } from "../middleware/requireRole.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.delete(
  "/products",
  requireAuth,
  requireRole(["admin", "manager"]),
  deleteAllProducts
);
router.delete(
  "/reservations",
  requireAuth,
  requireRole(["admin", "manager"]),
  deleteAllResrvations
);
router.delete(
  "/sales",
  requireAuth,
  requireRole(["admin", "manager"]),
  deleteAllSales
);

export default router;
