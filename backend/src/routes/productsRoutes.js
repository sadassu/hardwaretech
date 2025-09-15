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

const router = express.Router();

router.use(requireAuth);

router.get("/getproducts", getProducts);
router.get(
  "/products",
  queryOptions(["name", "description"], "name"),
  getAllProducts
);
router.get("/products/:id", getProductById);
router.post("/products", upload.single("image"), createProduct);
router.put("/products/:id", upload.single("image"), updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;
