import ProductVariant from "../models/ProductVariant.js";
import Sale from "../models/Sale.js";
import SupplyHistory from "../models/SupplyHistory.js";
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
  const { option } = req.query; 

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
      $dateToString: {
        format: "%Y-%m-%d",
        date: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
        },
      },
    };
  } else if (option === "monthly") {
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
    { $match: { totalSales: { $gt: 0 } } }, // exclude 0 sales
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
 * Controller: getStockStatus
 *
 * Fetches product variants based on stock status (low, out, or all).
 *
 * Features:
 * - Supports:
 *   - "low"  → quantity < 20 but > 0
 *   - "out"  → quantity = 0
 *   - "all"  → no filter (all items)
 * - Pagination support.
 * - limit=0 → only return counts.
 */
export const getStockStatus = async (req, res) => {
  try {
    const { type } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Validation
    if (!["low", "out", "all"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Use 'low', 'out', or 'all'.",
      });
    }

    // Build query depending on stock type
    let query = {};
    if (type === "low") query = { quantity: { $gt: 0, $lt: 50 } };
    if (type === "out") query = { quantity: 0 };
    if (type === "all") query = {}; // no filter

    const total = await ProductVariant.countDocuments(query);

    if (limit === 0) {
      return res.json({
        success: true,
        type,
        page,
        total,
        hasMore: false,
        items: [],
      });
    }

    const items = await ProductVariant.find(query)
      .populate({
        path: "product",
        select: "name description image category",
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      type,
      page,
      total,
      hasMore: skip + items.length < total,
      items,
    });
  } catch (error) {
    console.error("Error fetching stock status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get comparison of supply cost and sales totals
 *
 * Supports:
 * - ?option=weekly  → group by ISO week
 * - ?option=monthly → group by month
 * - ?year=YYYY      → optional, defaults to current year
 *
 * Response format:
 * [
 *   {
 *     year: 2025,
 *     period: "Week 40" or "2025-09",
 *     totalSupplyCost: 5000,
 *     totalSales: 8000,
 *     difference: 3000
 *   },
 *   ...
 * ]
 */
export const getSupplyAndSalesComparison = asyncHandler(async (req, res) => {
  const option = req.query.option || "weekly"; // default weekly
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  let groupStageSupply = {};
  let groupStageSales = {};

  if (option === "weekly") {
    // ----- WEEKLY AGGREGATION -----
    groupStageSupply = {
      _id: {
        year: { $isoWeekYear: "$supplied_at" },
        week: { $isoWeek: "$supplied_at" },
        month: { $month: "$supplied_at" },
      },
      totalSupplyCost: { $sum: "$total_cost" },
    };
    groupStageSales = {
      _id: {
        year: { $isoWeekYear: "$saleDate" },
        week: { $isoWeek: "$saleDate" },
        month: { $month: "$saleDate" },
      },
      totalSales: { $sum: "$totalPrice" },
    };
  } else if (option === "monthly") {
    // ----- MONTHLY AGGREGATION -----
    groupStageSupply = {
      _id: {
        year: { $year: "$supplied_at" },
        month: { $month: "$supplied_at" },
      },
      totalSupplyCost: { $sum: "$total_cost" },
    };
    groupStageSales = {
      _id: {
        year: { $year: "$saleDate" },
        month: { $month: "$saleDate" },
      },
      totalSales: { $sum: "$totalPrice" },
    };
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid option. Use 'weekly' or 'monthly'.",
    });
  }

  // Helper function to format week period
  const formatWeekPeriod = (year, week, month) => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Get the date of that ISO week
    const date = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = date.getDay();
    const ISOweekStart = new Date(date);
    if (dayOfWeek <= 4) {
      ISOweekStart.setDate(date.getDate() - date.getDay() + 1);
    } else {
      ISOweekStart.setDate(date.getDate() + 8 - date.getDay());
    }

    const monthOfWeek = ISOweekStart.getMonth() + 1;
    const dayOfMonth = ISOweekStart.getDate();

    // Calculate which week of the month it is
    const weekOfMonth = Math.ceil(dayOfMonth / 7);

    const ordinals = ["1st", "2nd", "3rd", "4th", "5th"];
    const ordinal = ordinals[weekOfMonth - 1] || `${weekOfMonth}th`;

    return `${ordinal} week of ${monthNames[monthOfWeek - 1]}`;
  };

  // Helper function to format month period
  const formatMonthPeriod = (month) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[month - 1];
  };

  // --- SUPPLY AGGREGATION ---
  const supplyAgg = await SupplyHistory.aggregate([
    {
      $match: {
        supplied_at: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${year}-12-31T23:59:59.999Z`),
        },
      },
    },
    { $group: groupStageSupply },
  ]);

  // --- SALES AGGREGATION ---
  const salesAgg = await Sale.aggregate([
    {
      $match: {
        saleDate: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${year}-12-31T23:59:59.999Z`),
        },
      },
    },
    { $group: groupStageSales },
  ]);

  // 🧩 Merge the two datasets
  const combined = [];
  const salesMap = new Map();

  // Index sales data
  for (const s of salesAgg) {
    const key =
      option === "weekly"
        ? `${s._id.year}-${s._id.week}`
        : `${s._id.year}-${s._id.month}`;
    salesMap.set(key, { totalSales: s.totalSales, month: s._id.month });
  }

  // Include all supply entries
  for (const s of supplyAgg) {
    const key =
      option === "weekly"
        ? `${s._id.year}-${s._id.week}`
        : `${s._id.year}-${s._id.month}`;
    const salesData = salesMap.get(key) || {
      totalSales: 0,
      month: s._id.month,
    };

    combined.push({
      year: s._id.year,
      period:
        option === "weekly"
          ? formatWeekPeriod(s._id.year, s._id.week, s._id.month)
          : formatMonthPeriod(s._id.month),
      week: option === "weekly" ? s._id.week : null,
      month: s._id.month,
      totalSupplyCost: s.totalSupplyCost,
      totalSales: salesData.totalSales,
      difference: salesData.totalSales - s.totalSupplyCost,
    });
    salesMap.delete(key);
  }

  // Include sales-only periods (no supply)
  for (const [key, salesData] of salesMap.entries()) {
    const [yr, periodNum] = key.split("-");
    const yearInt = parseInt(yr);
    const periodInt = parseInt(periodNum);

    combined.push({
      year: yearInt,
      period:
        option === "weekly"
          ? formatWeekPeriod(yearInt, periodInt, salesData.month)
          : formatMonthPeriod(periodInt),
      week: option === "weekly" ? periodInt : null,
      month: salesData.month,
      totalSupplyCost: 0,
      totalSales: salesData.totalSales,
      difference: salesData.totalSales,
    });
  }

  // Sort results
  combined.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (option === "weekly") {
      return (a.week || 0) - (b.week || 0);
    }
    return (a.month || 0) - (b.month || 0);
  });

  res.json({
    success: true,
    option,
    year,
    data: combined,
  });
});
