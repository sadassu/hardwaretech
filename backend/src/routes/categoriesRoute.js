import express from "express";
import {
  createCategory,
  getAllCategories,
} from "../controllers/categoriesController.js";

const router = express.Router();

router.get("/categories", getAllCategories);
router.post("/categories", createCategory);

export default router;
