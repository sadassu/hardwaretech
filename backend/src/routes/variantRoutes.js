import express from "express";
import {
  createVariant,
  deleteVariant,
  updateVariant,
} from "../controllers/variantController.js";

const router = express.Router();
// add
router.post("/product-variants", createVariant);
// delete
router.delete("/product-variants", deleteVariant);
// update
router.put("/product-variant", updateVariant);

export default router;
