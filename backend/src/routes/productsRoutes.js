import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/productsController.js";
import upload from "../middleware/upload.js";
import requireAuth from "../middleware/requireAuth.js";
import { queryOptions } from "../middleware/queryOption.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.use(requireAuth);

router.get("/getproducts", getProducts);
router.get(
  "/products",
  queryOptions(["name", "description"], "name"),
  getAllProducts
);
router.get("/products/:id", getProductById);
router.post(
  "/products",
  requireRole(["admin", "manager"]),
  upload.single("image"),
  createProduct
);
router.put(
  "/products/:id",
  requireRole(["admin", "manager"]),
  upload.single("image"),
  updateProduct
);
router.delete(
  "/products/:id",
  requireRole(["admin", "manager"]),
  deleteProduct
);

export default router;
