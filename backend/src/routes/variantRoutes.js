import express from "express";
import {
  createVariant,
  deleteVariant,
  restockVariant,
  updateVariant,
} from "../controllers/variantController.js";

const router = express.Router();
// add
router.post("", createVariant);
// delete
router.delete("/:id", deleteVariant);
// update
router.put("/:id", updateVariant);
//restock
router.post("/:id/restock", restockVariant);

export default router;
