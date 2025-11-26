import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import SupplyHistory from "../models/SupplyHistory.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  validateConversionRequest,
} from "../utils/variantStock.js";

// ✅ Create Variant
export const createVariant = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      productId,
      unit,
      size,
      dimension,
      dimensionType,
      price,
      quantity,
      supplier_price,
      color,
      notes,
      conversionSource,
      conversionQuantity,
      autoConvert,
      conversionNotes,
      includePerText,
    } = req.body;

    const existingProduct = await Product.findById(productId).session(session);
    if (!existingProduct) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Product not found" });
    }

    if (conversionSource) {
      await validateConversionRequest({
        productId: existingProduct._id,
        conversionSourceId: conversionSource,
      });
    }

    // Build variant data
    const newVariantData = {
      product: existingProduct._id,
      unit,
      size: size && size.trim() ? size.trim() : undefined,
      price,
      quantity,
      supplier_price,
    };
    if (color) newVariantData.color = color;
    if (dimension) newVariantData.dimension = dimension;
    if (dimensionType) newVariantData.dimensionType = dimensionType;
    if (conversionNotes) newVariantData.conversionNotes = conversionNotes;
    newVariantData.includePerText = Boolean(includePerText);

    newVariantData.conversionSource = conversionSource || null;
    newVariantData.autoConvert = Boolean(autoConvert) && Boolean(conversionSource);
    newVariantData.conversionQuantity =
      conversionSource && Number(conversionQuantity) > 0
        ? Number(conversionQuantity)
        : 1;

    const newVariant = await ProductVariant.create([newVariantData], {
      session,
    });
    const total_cost = quantity * supplier_price;

    await SupplyHistory.create(
      [
        {
          product_variant: newVariant[0]._id,
          quantity,
          supplier_price,
          total_cost,
          notes,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Product variant created successfully",
      productId: existingProduct._id,
      variant: newVariant[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

//Update Variant
export const updateVariant = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      unit,
      size,
      dimension,
      dimensionType,
      price,
      quantity,
      supplier_price,
      color,
      notes,
      conversionSource,
      conversionQuantity,
      autoConvert,
      conversionNotes,
      includePerText,
    } = req.body;

    const existingVariant = await ProductVariant.findById(
      req.params.id
    ).session(session);
    if (!existingVariant) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Product variant not found" });
    }

    if (conversionSource) {
      await validateConversionRequest({
        productId: existingVariant.product,
        conversionSourceId: conversionSource,
        variantId: existingVariant._id,
      });
    }

    // Build update data
    const updateData = {
      unit,
      size: size !== undefined ? (size && size.trim() ? size.trim() : null) : undefined,
      price,
      quantity,
      supplier_price,
    };
    if (color !== undefined) updateData.color = color;
    if (dimension !== undefined) updateData.dimension = dimension || null;
    if (dimensionType !== undefined) updateData.dimensionType = dimensionType || null;
    if (conversionNotes !== undefined) updateData.conversionNotes = conversionNotes;
    if (includePerText !== undefined) {
      updateData.includePerText = Boolean(includePerText);
    }

    if (conversionSource !== undefined) {
      updateData.conversionSource = conversionSource || null;
    }

    if (autoConvert !== undefined) {
      updateData.autoConvert = Boolean(autoConvert) && Boolean(conversionSource || existingVariant.conversionSource);
    }

    if (conversionQuantity !== undefined) {
      updateData.conversionQuantity =
        Number(conversionQuantity) > 0 ? Number(conversionQuantity) : 1;
    }

    const updatedVariant = await ProductVariant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true, session }
    ).populate("product");

    // ✅ Only add supply history if stock or supplier price changes
    if (quantity !== undefined || supplier_price !== undefined) {
      const total_cost =
        (quantity ?? existingVariant.quantity) *
        (supplier_price ?? existingVariant.supplier_price);

      await SupplyHistory.create(
        [
          {
            product_variant: updatedVariant._id,
            quantity: quantity ?? existingVariant.quantity,
            supplier_price: supplier_price ?? existingVariant.supplier_price,
            total_cost,
            notes,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Variant updated successfully",
      productId: updatedVariant.product._id,
      variant: updatedVariant,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// POST /variants/:id/restock
export const restockVariant = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params; // assuming route: /product-variants/:id/restock
    const { quantity, supplier_price, notes } = req.body;

    const parsedQuantity = Number(quantity);
    if (parsedQuantity <= 0) {
      return res.status(400).json({ message: "Quantity must be positive" });
    }

    // Fetch the variant inside the transaction
    const variant = await ProductVariant.findById(id).session(session);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Increase stock
    variant.quantity += parsedQuantity;

    if (supplier_price !== undefined) {
      variant.supplier_price = Number(supplier_price);
    }

    await variant.save({ session });

    // Log in supply history
    const effectiveSupplierPrice = supplier_price ?? variant.supplier_price;
    const total_cost = parsedQuantity * effectiveSupplierPrice;

    await SupplyHistory.create(
      [
        {
          product_variant: variant._id,
          quantity: parsedQuantity,
          supplier_price: effectiveSupplierPrice,
          total_cost,
          notes,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      message: "Restocked successfully",
      productId: variant.product,
      variant,
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
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
