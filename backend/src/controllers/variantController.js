import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ Create Variant
export const createVariant = asyncHandler(async (req, res) => {
  const { productId, unit, size, price, quantity } = req.body;

  const existingProduct = await Product.findById(productId);

  if (!existingProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  const newVariant = await ProductVariant.create({
    product: existingProduct._id,
    unit,
    size,
    price,
    quantity,
  });

  res.status(201).json({
    message: "Product variant created successfully",
    productId: existingProduct._id,
    variant: newVariant,
  });
});

//Update Variant
export const updateVariant = asyncHandler(async (req, res) => {
  const { unit, size, price, quantity } = req.body;

  const updatedVariant = await ProductVariant.findByIdAndUpdate(
    req.params.id,
    { unit, size, price, quantity },
    { new: true, runValidators: true }
  ).populate("product");

  if (!updatedVariant) {
    return res.status(404).json({ message: "Product variant not found" });
  }

  res.status(200).json({
    message: "Variant updated successfully",
    productId: updatedVariant.product._id,
    variant: updatedVariant,
  });
});

export const deleteVariant = asyncHandler(async (req, res) => {
  const deletedVariant = await ProductVariant.findByIdAndDelete(
    req.params.id
  ).populate("product");

  if (!deletedVariant) {
    return res.status(404).json({ message: "Product variant not found" });
  }

  res.status(200).json({
    message: "Product variant deleted successfully",
    productId: deletedVariant.product._id, 
    variantId: deletedVariant._id,
  });
});
