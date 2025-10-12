import express from "express";
import {
  createVariant,
  deleteVariant,
  restockVariant,
  updateVariant,
} from "../controllers/variantController.js";
import requireAuth from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();
// add
router.post("", requireAuth, requireRole(["admin", "cashier"]), createVariant);
// delete
router.delete(
  "/:id",
  requireAuth,
  requireRole(["admin", "cashier"]),
  deleteVariant
);
// update
router.put(
  "/:id",
  requireAuth,
  requireRole(["admin", "cashier"]),
  updateVariant
);
//restock
router.post(
  "/:id/restock",
  requireAuth,
  requireRole(["admin", "cashier"]),
  restockVariant
);

export default router;
