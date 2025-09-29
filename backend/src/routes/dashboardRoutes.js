import express from "express";
import { getDashboardSales } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/sales", getDashboardSales);

export default router;
