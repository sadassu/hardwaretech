import express from "express";
import {
  getSupplyHistory,
  redoSupplyHistory,
} from "../controllers/supplyHistoriesController.js";

const router = express.Router();

router.get("/", getSupplyHistory);
router.post("/:id/redo", redoSupplyHistory);

export default router;
