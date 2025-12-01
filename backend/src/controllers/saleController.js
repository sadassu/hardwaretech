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

    // ✅ Map variantId → productVariantId and store product name/variant details
    // Fetch all variants with their products to get names
    const variantIds = items.map((item) => item.variantId);
    const variantsWithProducts = await ProductVariant.find({
      _id: { $in: variantIds },
    })
      .populate({
        path: "product",
        populate: { path: "category" }
      })
      .session(session);

    const variantMap = new Map();
    variantsWithProducts.forEach((v) => {
      variantMap.set(v._id.toString(), v);
    });

    const saleItems = items.map((item) => {
      const variant = variantMap.get(item.variantId.toString());
      const productName = variant?.product?.name || "Unknown Product";
      const categoryName = variant?.product?.category?.name || "";
      
      return {
      productVariantId: item.variantId,
        productName: productName, // Store product name directly
        categoryName: categoryName, // Store category name for persistence
        size: item.size || variant?.size || "",
        unit: item.unit || variant?.unit || "",
        color: variant?.color || "",
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      };
    });

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

  // If search provided, match across saleIdString, cashier name/email, variants.name, variants.product.name, or stored productName
  if (searchRegex) {
    matchConditions.push({
      $or: [
        { saleIdString: { $regex: searchRegex } },
        { "cashier.name": { $regex: searchRegex } },
        { "cashier.email": { $regex: searchRegex } },
        { "variants.name": { $regex: searchRegex } },
        { "variants.product.name": { $regex: searchRegex } },
        { "items.productName": { $regex: searchRegex } }, // Search stored product names
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
        // Use stored productName as fallback when product/variant is deleted
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
                  // Use stored productName (preserved even if product is deleted)
                  productName: {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$variants",
                                  as: "v",
                                  cond: { $eq: ["$$v._id", "$$it.productVariantId"] },
                                },
                              },
                              as: "v",
                              in: "$$v.product.name",
                            },
                          },
                          0,
                        ],
                      },
                      {
                        $ifNull: [
                          "$$it.productName", // Fallback to stored name
                          "Unknown Product", // Final fallback for old sales with deleted products
                        ],
                      },
                    ],
                  },
                  productId: "$$it.productId",
                  quantity: "$$it.quantity",
                  price: "$$it.price",
                  subtotal: "$$it.subtotal",
                  size: {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$variants",
                                  as: "v",
                                  cond: { $eq: ["$$v._id", "$$it.productVariantId"] },
                                },
                              },
                              as: "v",
                              in: "$$v.size",
                            },
                          },
                          0,
                        ],
                      },
                      "$$it.size", // Fallback to stored size
                    ],
                  },
                  unit: {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$variants",
                                  as: "v",
                                  cond: { $eq: ["$$v._id", "$$it.productVariantId"] },
                                },
                              },
                              as: "v",
                              in: "$$v.unit",
                            },
                          },
                          0,
                        ],
                      },
                      "$$it.unit", // Fallback to stored unit
                    ],
                  },
                  color: "$$it.color", // Include stored color
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

// Export sales to CSV
export const exportSales = asyncHandler(async (req, res) => {
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

  // Aggregation pipeline (similar to getSales but without pagination)
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

  // Build match conditions (same as getSales)
  const matchConditions = [];

  if (typeFilter) {
    matchConditions.push({ type: typeFilter });
  }

  if (dateFrom || dateTo) {
    const dateMatch = {};
    if (dateFrom) dateMatch.$gte = new Date(dateFrom);
    if (dateTo) {
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

  if (searchRegex) {
    matchConditions.push({
      $or: [
        { saleIdString: { $regex: searchRegex } },
        { "cashier.name": { $regex: searchRegex } },
        { "cashier.email": { $regex: searchRegex } },
        { "variants.name": { $regex: searchRegex } },
        { "variants.product.name": { $regex: searchRegex } },
        { "items.productName": { $regex: searchRegex } }, // Search stored product names
      ],
    });
  }

  if (matchConditions.length > 0) {
    pipeline.push({ $match: { $and: matchConditions } });
  }

  // Sort by saleDate descending
  pipeline.push({ $sort: { saleDate: -1 } });

  // Map items to include populated productVariantId
  // Use stored productName as fallback when product/variant is deleted
  pipeline.push({
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
            // Use stored productName (preserved even if product is deleted)
            productName: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$variants",
                            as: "v",
                            cond: { $eq: ["$$v._id", "$$it.productVariantId"] },
                          },
                        },
                        as: "v",
                        in: "$$v.product.name",
                      },
                    },
                    0,
                  ],
                },
                {
                  $ifNull: [
                    "$$it.productName", // Fallback to stored name
                    "Unknown Product", // Final fallback for old sales with deleted products
                  ],
                },
              ],
            },
            productId: "$$it.productId",
            quantity: "$$it.quantity",
            price: "$$it.price",
            subtotal: "$$it.subtotal",
            size: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$variants",
                            as: "v",
                            cond: { $eq: ["$$v._id", "$$it.productVariantId"] },
                          },
                        },
                        as: "v",
                        in: "$$v.size",
                      },
                    },
                    0,
                  ],
                },
                "$$it.size", // Fallback to stored size
              ],
            },
            unit: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$variants",
                            as: "v",
                            cond: { $eq: ["$$v._id", "$$it.productVariantId"] },
                          },
                        },
                        as: "v",
                        in: "$$v.unit",
                      },
                    },
                    0,
                  ],
                },
                "$$it.unit", // Fallback to stored unit
              ],
            },
            color: "$$it.color", // Include stored color
          },
        },
      },
    },
  });

  // Remove temporary fields
  pipeline.push({
    $project: {
      variants: 0,
      saleIdString: 0,
    },
  });

  const sales = await Sale.aggregate(pipeline);

  // Convert to CSV
  const csvRows = [];
  
  // CSV Header
  csvRows.push([
    "Sale ID",
    "Sale Date",
    "Type",
    "Cashier Name",
    "Cashier Email",
    "Total Price",
    "Amount Paid",
    "Change",
    "Status",
    "Product Name",
    "Quantity",
    "Unit",
    "Size",
    "Unit Price",
    "Subtotal",
  ].join(","));

  // CSV Data Rows
  sales.forEach((sale) => {
    const saleId = sale._id.toString().slice(-8);
    const saleDate = new Date(sale.saleDate).toLocaleString("en-PH");
    const type = sale.type?.toUpperCase() || "N/A";
    const cashierName = sale.cashier?.name || "Unknown";
    const cashierEmail = sale.cashier?.email || "";
    const totalPrice = sale.totalPrice || 0;
    const amountPaid = sale.amountPaid || 0;
    const change = sale.change || 0;
    const status = amountPaid >= totalPrice ? "PAID" : "PARTIAL";

    if (sale.items && sale.items.length > 0) {
      sale.items.forEach((item) => {
        const variant = item.productVariantId;
        const product = variant?.product;
        // Use stored productName as fallback when product/variant is deleted
        const productName = product?.name || item.productName || variant?.name || "Unnamed Product";
        const quantity = item.quantity || 0;
        const unit = item.unit || "";
        const size = item.size || "";
        const unitPrice = item.price || 0;
        const subtotal = item.subtotal || 0;

        // Escape commas and quotes in CSV
        const escapeCSV = (str) => {
          if (str === null || str === undefined) return "";
          const string = String(str);
          if (string.includes(",") || string.includes('"') || string.includes("\n")) {
            return `"${string.replace(/"/g, '""')}"`;
          }
          return string;
        };

        csvRows.push([
          escapeCSV(saleId),
          escapeCSV(saleDate),
          escapeCSV(type),
          escapeCSV(cashierName),
          escapeCSV(cashierEmail),
          escapeCSV(totalPrice.toFixed(2)),
          escapeCSV(amountPaid.toFixed(2)),
          escapeCSV(change.toFixed(2)),
          escapeCSV(status),
          escapeCSV(productName),
          escapeCSV(quantity),
          escapeCSV(unit),
          escapeCSV(size),
          escapeCSV(unitPrice.toFixed(2)),
          escapeCSV(subtotal.toFixed(2)),
        ].join(","));
      });
    } else {
      // If no items, still add a row for the sale
      csvRows.push([
        saleId,
        saleDate,
        type,
        cashierName,
        cashierEmail,
        totalPrice.toFixed(2),
        amountPaid.toFixed(2),
        change.toFixed(2),
        status,
        "",
        "",
        "",
        "",
        "",
        "",
      ].join(","));
    }
  });

  const csvContent = csvRows.join("\n");

  // Set headers for CSV download
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=sales-export-${new Date().toISOString().split("T")[0]}.csv`
  );
  res.status(200).send(csvContent);
});

// get the daily sales (POS only, timezone-aware)
export const getDailySales = asyncHandler(async (req, res) => {
  // Compute "today" based on Philippines time, not server timezone
  const now = new Date();
  const phNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );

  const todayString = phNow.toISOString().split("T")[0]; // "YYYY-MM-DD" in PH local date

  const result = await Sale.aggregate([
    {
      // Only include POS transactions
      $match: { type: "pos" },
    },
    {
      // Convert saleDate to PH local date string and filter to "today"
      $addFields: {
        localDate: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$saleDate",
            timezone: "Asia/Manila",
          },
        },
      },
    },
    {
      $match: {
        localDate: todayString,
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
    date: todayString,
    totalSales,
  });
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

// get the monthly sales (POS only, timezone-aware)
export const getMonthlySales = async (req, res) => {
  try {
    // Use Philippines timezone for month boundaries
    const now = new Date();
    const phNow = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Manila" })
    );

    const year = phNow.getFullYear();
    const month = phNow.getMonth() + 1; // 1–12
    const yearMonthString = `${year}-${String(month).padStart(2, "0")}`; // "YYYY-MM"

    const result = await Sale.aggregate([
      {
        // Only include POS transactions
        $match: { type: "pos" },
      },
      {
        // Convert saleDate to PH local "YYYY-MM" and filter current month
        $addFields: {
          localYearMonth: {
            $dateToString: {
              format: "%Y-%m",
              date: "$saleDate",
              timezone: "Asia/Manila",
            },
          },
        },
      },
      {
        $match: {
          localYearMonth: yearMonthString,
        },
      },
      {
        $group: {
          _id: null,
          totalMonthlySales: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalMonthlySales =
      result.length > 0 ? result[0].totalMonthlySales : 0;

    res.status(200).json({
      year,
      month,
      totalMonthlySales,
    });
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
