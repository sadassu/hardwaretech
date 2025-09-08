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

const router = express.Router();

router.get("/getproducts", getProducts);
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.post("/products", upload.single("image"), createProduct);
router.put("/products/:id", upload.single("image"), updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;
