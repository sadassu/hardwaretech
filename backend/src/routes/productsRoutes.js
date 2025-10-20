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
import requireAuthCookies from "../middleware/requireAuthCookies.js";

const router = express.Router();

router.get("/getproducts", getProducts);
router.get(
  "/products",
  queryOptions(["name", "description"], "name"),
  getAllProducts
);
router.get("/products/:id", getProductById);
router.post(
  "/products",
  requireAuthCookies,
  requireRole(["admin", "cashier"]),
  createProduct
);
router.put(
  "/products/:id",
  requireAuth,
  requireRole(["admin", "cashier"]),
  updateProduct
);
router.delete(
  "/products/:id",
  requireAuth,
  requireRole(["admin", "cashier"]),
  deleteProduct
);

export default router;
