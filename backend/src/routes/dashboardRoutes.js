import express from "express";
import {
  getDashboardSales,
  getStockStatus,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/sales", getDashboardSales);
router.get("/stocks", getStockStatus);

export default router;
