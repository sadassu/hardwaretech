import Sale from "../models/Sale.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get dashboard sales data
 *
 * This function returns aggregated sales depending on the requested option:
 *
 * - daily   → Returns sales totals for the last 14 days, grouped by day.
 * - monthly → Returns sales totals for all months of the current year.
 * - yearly  → Returns sales totals grouped by year.
 *
 * Query param:
 *   option = "daily" | "monthly" | "yearly"
 *
 * Response format:
 * [
 *   {
 *     period: "2025-09-28",  // or "2025-09" or "2025" depending on option
 *     totalSales: 12345,     // sum of totalPrice
 *     count: 10              // number of sales
 *   },
 *   ...
 * ]
 */

export const getDashboardSales = asyncHandler(async (req, res) => {
  const { option } = req.query; // "daily", "monthly", "yearly"

  let groupStage = {};
  let matchStage = {};
  let formatDate = {};

  if (option === "daily") {
    // Last 14 days
    const today = new Date();
    const past14 = new Date();
    past14.setDate(today.getDate() - 14);

    matchStage = {
      saleDate: { $gte: past14, $lte: today },
    };

    groupStage = {
      _id: {
        year: { $year: "$saleDate" },
        month: { $month: "$saleDate" },
        day: { $dayOfMonth: "$saleDate" },
      },
      totalSales: { $sum: "$totalPrice" },
      count: { $sum: 1 },
    };

    formatDate = {
      $dateToString: { format: "%Y-%m-%d", date: "$saleDate" },
    };
  } else if (option === "monthly") {
    // Current year by month
    const currentYear = new Date().getFullYear();
    const start = new Date(`${currentYear}-01-01`);
    const end = new Date(`${currentYear}-12-31`);

    matchStage = {
      saleDate: { $gte: start, $lte: end },
    };

    groupStage = {
      _id: { year: { $year: "$saleDate" }, month: { $month: "$saleDate" } },
      totalSales: { $sum: "$totalPrice" },
      count: { $sum: 1 },
    };

    formatDate = {
      $concat: [{ $toString: "$_id.year" }, "-", { $toString: "$_id.month" }],
    };
  } else if (option === "yearly") {
    // Group all sales by year
    groupStage = {
      _id: { year: { $year: "$saleDate" } },
      totalSales: { $sum: "$totalPrice" },
      count: { $sum: 1 },
    };

    formatDate = { $toString: "$_id.year" };
  } else {
    return res.status(400).json({ message: "Invalid option" });
  }

  const sales = await Sale.aggregate([
    { $match: matchStage },
    { $group: groupStage },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    {
      $project: {
        _id: 0,
        period: formatDate,
        totalSales: 1,
        count: 1,
      },
    },
  ]);

  res.json(sales);
});

/**
 * Get total sales sum for the current year
 *
 * This function calculates the overall sales total for the current year
 * across all Sale documents.
 *
 * Response format:
 * {
 *   totalSales: 123456  // sum of all totalPrice values for the current year
 * }
 */

export const getTotalSalesYear = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const start = new Date(`${currentYear}-01-01T00:00:00.000Z`);
  const end = new Date(`${currentYear}-12-31T23:59:59.999Z`);

  const result = await Sale.aggregate([
    {
      $match: {
        saleDate: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalPrice" },
      },
    },
  ]);

  res.json({
    totalSales: result.length > 0 ? result[0].totalSales : 0,
  });
});
