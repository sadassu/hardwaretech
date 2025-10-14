import mongoose from "mongoose";
import Sale from "../models/Sale.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ProductVariant from "../models/ProductVariant.js";

// create sale to the sale and sale_details
export const createSale = asyncHandler(async (req, res) => {
  const { items, amountPaid, cashier } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Sale must include items." });
  }

  // 1️⃣ Calculate total sale amount
  let totalAmount = 0;
  for (const item of items) {
    const variant = await ProductVariant.findById(item.variantId).populate(
      "product"
    );
    if (!variant) {
      return res
        .status(404)
        .json({ error: `Variant not found for ${item.productId}` });
    }

    const price = variant.price ?? variant.product?.price ?? 0;
    totalAmount += price * item.quantity;
  }

  if (amountPaid < totalAmount) {
    return res.status(400).json({
      error: `Insufficient amount. Total: ${totalAmount}, Paid: ${amountPaid}`,
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of items) {
      const variant = await ProductVariant.findById(item.variantId).session(
        session
      );
      if (!variant) {
        await session.abortTransaction();
        return res
          .status(404)
          .json({ error: `Variant not found for ${item.productId}` });
      }

      if (variant.quantity < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          error: `Not enough stock for ${item.productId} (requested: ${item.quantity}, available: ${variant.quantity})`,
        });
      }

      variant.quantity -= item.quantity;
      await variant.save({ session });
    }

    // ✅ Map variantId → productVariantId to match schema
    const saleItems = items.map((item) => ({
      productVariantId: item.variantId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      size: item.size,
      unit: item.unit,
    }));

    const sale = new Sale({
      items: saleItems,
      amountPaid,
      cashier,
      type: "pos",
    });

    await sale.save({ session });
    await session.commitTransaction();
    session.endSession();

    const updatedVariants = await ProductVariant.find({
      _id: { $in: items.map((i) => i.variantId) },
    });

    res.status(201).json({
      message: "Sale created successfully.",
      sale,
      updatedVariants,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Sale creation failed:", error);
    res.status(500).json({ error: "Failed to create sale" });
  }
});

// fetch all sale for admin
export const getSales = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "saleDate";
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

  const skip = (page - 1) * limit;

  const sales = await Sale.find()
    .populate({
      path: "items.productVariantId", // populate the ProductVariant
      populate: {
        path: "product", // then populate the Product inside ProductVariant
        select: "name category image", // optional: select only needed fields
      },
    })
    .populate("cashier", "name email roles") // populate cashier info
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  if (!sales || sales.length === 0) {
    return res.status(404).json({ message: "No sales found" });
  }

  const total = await Sale.countDocuments();

  res.status(200).json({
    total,
    page,
    pages: Math.ceil(total / limit),
    sales,
  });
});
