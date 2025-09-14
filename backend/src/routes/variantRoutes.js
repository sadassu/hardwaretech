import express from "express";
import {
  createVariant,
  deleteVariant,
  updateVariant,
} from "../controllers/variantController.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();
// add
router.post("", createVariant);
// delete
router.delete("/:id", deleteVariant);
// update
router.put("/:id", updateVariant);

export default router;
