import mongoose from "mongoose";
import ProductVariant from "../models/ProductVariant.js";
import SupplyHistory from "../models/SupplyHistory.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSupplyHistory = asyncHandler(async (req, res) => {
  let { month, sort, order, page = 1, limit = 10, search } = req.query;

  // Ensure numbers
  page = Number(page);
  limit = Number(limit);

  let filter = {};

  // 📌 Filter by month
  if (month) {
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    filter.supplied_at = { $gte: start, $lt: end };
  }

  // 📌 Sorting
  let sortOption = {};
  if (sort === "quantity") {
    sortOption.quantity = order === "asc" ? 1 : -1;
  } else if (sort === "date") {
    sortOption.supplied_at = order === "asc" ? 1 : -1;
  } else {
    sortOption.createdAt = -1;
  }

  const skip = (page - 1) * limit;

  // 📌 Build query
  let query = SupplyHistory.find(filter)
    .populate({
      path: "product_variant",
      populate: { path: "product", model: "Product" },
    })
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  let histories = await query.exec();

  // 📌 If searching by product name
  if (search) {
    const regex = new RegExp(search, "i"); // case-insensitive
    histories = histories.filter(
      (h) =>
        h.product_variant?.product?.name &&
        regex.test(h.product_variant.product.name)
    );
  }

  // 📌 Count total (respecting search filter)
  let total = await SupplyHistory.countDocuments(filter);

  if (search) {
    // adjust total if search applied
    total = histories.length;
  }

  res.status(200).json({
    total,
    page,
    pages: Math.ceil(total / limit),
    histories,
  });
});

// POST /supply-history/:id/redo
export const redoSupplyHistory = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;

    // Find the supply history with its product variant
    const history = await SupplyHistory.findById(id)
      .populate("product_variant")
      .session(session);

    if (!history) {
      throw new Error("Supply history not found");
    }

    const variant = await ProductVariant.findById(
      history.product_variant._id
    ).session(session);

    if (!variant) {
      throw new Error("Product variant not found");
    }

    // Subtract the quantity from the variant stock
    variant.quantity -= history.quantity;
    if (variant.quantity < 0) variant.quantity = 0; // prevent negative stock
    await variant.save({ session });

    // Delete the supply history record
    await SupplyHistory.deleteOne({ _id: id }, { session });

    await session.commitTransaction();

    res.status(200).json({
      message: "Supply history deleted and stock updated successfully",
      variant,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});
