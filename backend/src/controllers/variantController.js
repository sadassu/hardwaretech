import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ Create Variant
export const createVariant = asyncHandler(async (req, res) => {
  const { productId, unit, size, price, quantity, supplier_price, color } =
    req.body;

  const existingProduct = await Product.findById(productId);

  if (!existingProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Build variant data
  const newVariantData = {
    product: existingProduct._id,
    unit,
    size,
    price,
    quantity,
    supplier_price,
  };

  // ✅ Only add color if it was provided
  if (color) {
    newVariantData.color = color;
  }

  const newVariant = await ProductVariant.create(newVariantData);

  res.status(201).json({
    message: "Product variant created successfully",
    productId: existingProduct._id,
    variant: newVariant,
  });
});

//Update Variant
export const updateVariant = asyncHandler(async (req, res) => {
  const { unit, size, price, quantity, supplier_price, color } = req.body;

  // Build update data
  const updateData = { unit, size, price, quantity, supplier_price };

  // ✅ Only add color if provided
  if (color !== undefined) {
    updateData.color = color;
  }

  const updatedVariant = await ProductVariant.findByIdAndUpdate(
    req.params.id,
    updateData,
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
