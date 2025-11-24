import mongoose from "mongoose";
import Sale from "../models/Sale.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ProductVariant from "../models/ProductVariant.js";
import { ensureVariantStock } from "../utils/variantStock.js";

// this is what the pos use to insert the sale from the mongodb
// it accepts the items the amount paid and the cashier or the user logged in
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

      await ensureVariantStock({
        variant,
        requiredQuantity: item.quantity,
        session,
      });

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

  // Accept filters
  const {
    search,
    cashier: cashierFilter,
    type: typeFilter,
    status: statusFilter,
    dateFrom,
    dateTo,
  } = req.query;

  // Build regex for search if present
  const searchRegex = search ? new RegExp(search, "i") : null;

  // Aggregation pipeline
  const pipeline = [];

  // Add saleId as string to allow regex search on id
  pipeline.push({
    $addFields: {
      saleIdString: { $toString: "$_id" },
    },
  });

  // Lookup cashier (users collection)
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "cashier",
      foreignField: "_id",
      as: "cashier",
    },
  });
  pipeline.push({
    $unwind: { path: "$cashier", preserveNullAndEmptyArrays: true },
  });

  // Lookup product variants referenced in items and populate their product
  pipeline.push({
    $lookup: {
      from: "productvariants",
      let: { variantIds: "$items.productVariantId" },
      pipeline: [
        {
          $match: {
            $expr: { $in: ["$_id", "$$variantIds"] },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      ],
      as: "variants",
    },
  });

  // Build match conditions
  const matchConditions = [];

  if (typeFilter) {
    matchConditions.push({ type: typeFilter });
  }

  if (dateFrom || dateTo) {
    const dateMatch = {};
    if (dateFrom) dateMatch.$gte = new Date(dateFrom);
    if (dateTo) {
      // include end of day for dateTo
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);
      dateMatch.$lte = d;
    }
    matchConditions.push({ saleDate: dateMatch });
  }

  if (statusFilter) {
    if (statusFilter.toLowerCase() === "paid") {
      matchConditions.push({ $expr: { $gte: ["$amountPaid", "$totalPrice"] } });
    } else if (statusFilter.toLowerCase() === "partial") {
      matchConditions.push({ $expr: { $lt: ["$amountPaid", "$totalPrice"] } });
    }
  }

  // Cashier filter: accept a possible ObjectId string or match name/email (case-insensitive)
  if (cashierFilter) {
    if (mongoose.Types.ObjectId.isValid(cashierFilter)) {
      matchConditions.push({ cashier: mongoose.Types.ObjectId(cashierFilter) });
    } else {
      const cfRegex = new RegExp(cashierFilter, "i");
      matchConditions.push({
        $or: [{ "cashier.name": cfRegex }, { "cashier.email": cfRegex }],
      });
    }
  }

  // If search provided, match across saleIdString, cashier name/email, variants.name or variants.product.name
  if (searchRegex) {
    matchConditions.push({
      $or: [
        { saleIdString: { $regex: searchRegex } },
        { "cashier.name": { $regex: searchRegex } },
        { "cashier.email": { $regex: searchRegex } },
        { "variants.name": { $regex: searchRegex } },
        { "variants.product.name": { $regex: searchRegex } },
      ],
    });
  }

  if (matchConditions.length > 0) {
    pipeline.push({ $match: { $and: matchConditions } });
  }

  // Sort stage
  pipeline.push({ $sort: { [sortBy]: sortOrder } });

  // Use facet to get total count and paginated results in one query
  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }],
      data: [
        // Map items to include the populated productVariantId object from variants lookup
        {
          $addFields: {
            items: {
              $map: {
                input: "$items",
                as: "it",
                in: {
                  productVariantId: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$variants",
                          as: "v",
                          cond: { $eq: ["$$v._id", "$$it.productVariantId"] },
                        },
                      },
                      0,
                    ],
                  },
                  productId: "$$it.productId",
                  quantity: "$$it.quantity",
                  price: "$$it.price",
                  subtotal: "$$it.subtotal",
                  size: "$$it.size",
                  unit: "$$it.unit",
                },
              },
            },
          },
        },
        // Optionally remove the temporary fields we used for lookups
        {
          $project: {
            variants: 0,
            saleIdString: 0,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ],
    },
  });

  const result = await Sale.aggregate(pipeline);

  const metadata = result[0].metadata[0] || { total: 0 };
  const total = metadata.total || 0;
  const sales = result[0].data || [];

  // Calculate total pages
  const pages = Math.ceil(total / limit) || 1;

  res.status(200).json({
    total,
    page,
    pages,
    sales,
  });
});

// get the daily sales
export const getDailySales = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const result = await Sale.aggregate([
    {
      $match: {
        saleDate: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalPrice" },
      },
    },
  ]);

  const totalSales = result.length > 0 ? result[0].totalSales : 0;

  res.status(200).json({ date: startOfDay.toDateString(), totalSales });
});

// take the annual sales
export const getAnnualSales = async (req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const result = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: null,
          totalAnnualSales: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalAnnualSales = result.length > 0 ? result[0].totalAnnualSales : 0;

    res.status(200).json({
      year: now.getFullYear(),
      totalAnnualSales,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// take the this year sales
export const getThisYearSales = async (req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // Jan 1
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // Dec 31

    // Aggregate total sales within this year
    const result = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalSales = result.length > 0 ? result[0].totalSales : 0;

    res.status(200).json({
      year: now.getFullYear(),
      totalSales,
    });
  } catch (error) {
    console.error("Error fetching this year's sales:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// get the monthly sales
export const getMonthlySales = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const result = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalMonthlySales: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalMonthlySales = result.length > 0 ? result[0].totalMonthlySales : 0;

    res.status(200).json({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      totalMonthlySales,
    });
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
