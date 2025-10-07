import express from "express";
import { getSupplyHistory } from "../controllers/supplyHistoriesController.js";

const router = express.Router();

router.get("/", getSupplyHistory);

export default router;
