import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
} from "../controllers/categoriesController.js";
import requireAuth from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post(
  "/",
  requireAuth,
  requireRole(["admin", "cashier"]),
  createCategory
);
router.delete(
  "/:id",
  requireAuth,
  requireRole(["admin", "cashier"]),
  deleteCategory
);

export default router;
