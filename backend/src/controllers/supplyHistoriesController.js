import mongoose from "mongoose";
import ProductVariant from "../models/ProductVariant.js";
import SupplyHistory from "../models/SupplyHistory.js";
import InventoryLoss from "../models/InventoryLoss.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSupplyHistory = asyncHandler(async (req, res) => {
  let {
    month,
    startDate,
    endDate,
    sort,
    order,
    page = 1,
    limit = 10,
    search,
  } = req.query;

  // Ensure numbers
  page = Number(page);
  limit = Number(limit);

  let filter = {};

  // 📌 Filter by date range (startDate & endDate)
  if (startDate && endDate) {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);
    filter.supplied_at = { $gte: start, $lte: end };
  }
  // 📌 Filter by specific date (if only startDate provided)
  else if (startDate) {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${startDate}T23:59:59.999Z`);
    filter.supplied_at = { $gte: start, $lte: end };
  }
  // 📌 Filter by month (only if no dates provided)
  else if (month) {
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
    total = histories.length; // adjust total if search applied
  }

  res.status(200).json({
    total,
    page,
    pages: Math.ceil(total / limit),
    histories,
  });
});

export const getMoneySpentSevenDays = asyncHandler(async (req, res) => {
  // Get date range for the last 7 days
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6); // include today (7 total days)

  // Aggregate by day
  const result = await SupplyHistory.aggregate([
    {
      $match: {
        supplied_at: {
          $gte: sevenDaysAgo,
          $lte: today,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$supplied_at" },
        },
        totalSpent: { $sum: "$total_cost" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Fill missing days with 0
  const data = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + i);
    const dateString = date.toISOString().slice(0, 10);

    const dayData = result.find((r) => r._id === dateString);
    data.push({
      date: dateString,
      totalSpent: dayData ? dayData.totalSpent : 0,
    });
  }

  res.json({
    success: true,
    data,
  });
});

export const getItemsStockedSevenDays = asyncHandler(async (req, res) => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6); // includes today = 7 days total

  // Group by date and count total items stocked
  const items = await SupplyHistory.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo, $lte: today },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        totalItems: { $sum: "$quantity" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Fill missing days with zero
  const result = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + i);
    const formatted = date.toISOString().split("T")[0];
    const found = items.find((item) => item._id === formatted);
    result.push({
      date: formatted,
      totalItems: found ? found.totalItems : 0,
    });
  }

  return res.status(200).json({
    success: true,
    data: result, // 👈 you’ll access this via res.data.data
  });
});

export const getTotalMoneySpent = asyncHandler(async (req, res) => {
  try {
    const result = await SupplyHistory.aggregate([
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$total_cost" },
        },
      },
    ]);

    const total = result.length > 0 ? result[0].totalSpent : 0;

    res.status(200).json({
      success: true,
      message: "Total money spent on all stocked items retrieved successfully.",
      total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to calculate total money spent.",
      error: error.message,
    });
  }
});

export const getLostMoneyStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [totalAgg, last7Agg] = await Promise.all([
    InventoryLoss.aggregate([
      {
        $group: {
          _id: null,
          totalLost: { $sum: "$amount" },
        },
      },
    ]),
    InventoryLoss.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sevenDaysAgo,
            $lte: today,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalLost: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  // Round to 2 decimal places
  const totalLost = totalAgg.length > 0 ? totalAgg[0].totalLost : 0;
  const last7Lost = last7Agg.length > 0 ? last7Agg[0].totalLost : 0;

  res.status(200).json({
    success: true,
    totalLostMoney: Math.round(totalLost * 100) / 100,
    last7DaysLostMoney: Math.round(last7Lost * 100) / 100,
  });
});

export const getTotalStock = asyncHandler(async (req, res) => {
  const result = await ProductVariant.aggregate([
    {
      $group: {
        _id: null,
        totalStock: { $sum: "$quantity" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    totalStock: result.length > 0 ? result[0].totalStock : 0,
  });
});
