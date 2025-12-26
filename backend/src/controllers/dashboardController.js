import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import Sale from "../models/Sale.js";
import SupplyHistory from "../models/SupplyHistory.js";
import Reservation from "../models/Reservation.js";
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
  const yearParam = parseInt(req.query.year, 10);
  const currentYear = new Date().getFullYear();
  const selectedYear =
    Number.isInteger(yearParam) && yearParam >= 2000 && yearParam <= currentYear
      ? yearParam
      : currentYear;

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

    // Group by date in Philippines timezone (UTC+8)
    // Convert saleDate to Philippines timezone by using $dateToString with timezone
    // Then extract date parts from the converted date
    groupStage = {
      _id: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$saleDate",
          timezone: "Asia/Manila"
        }
      },
      totalSales: { $sum: "$totalPrice" },
      count: { $sum: 1 },
    };

    formatDate = "$_id";
  } else if (option === "monthly") {
    const start = new Date(`${selectedYear}-01-01`);
    const end = new Date(`${selectedYear}-12-31`);

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
    const start = new Date(`${selectedYear}-01-01`);
    const end = new Date(`${selectedYear}-12-31`);

    matchStage = {
      saleDate: { $gte: start, $lte: end },
    };

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
    { $sort: { "_id": option === "daily" ? 1 : option === "monthly" ? 1 : 1 } }, // Sort by date string (YYYY-MM-DD format sorts correctly)
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
 * Get overall sales statistics since business start
 * Returns total sales and total number of sales records
 */
export const getOverallSalesStats = asyncHandler(async (req, res) => {
  const result = await Sale.aggregate([
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$saleDate",
          },
        },
        dailyTotal: { $sum: "$totalPrice" },
      },
    },
    {
      $match: {
        dailyTotal: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$dailyTotal" },
        totalDaysWithSales: { $sum: 1 },
      },
    },
  ]);

  const stats =
    result.length > 0
      ? {
          totalSales: result[0].totalSales || 0,
          totalCount: result[0].totalDaysWithSales || 0,
        }
      : {
          totalSales: 0,
          totalCount: 0,
        };

  res.json(stats);
});

const getWeekRange = (year, week) => {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dayOfWeek = simple.getDay() || 7; // Sunday => 7
  const weekStart = new Date(simple);
  weekStart.setDate(simple.getDate() - dayOfWeek + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return { start: weekStart, end: weekEnd };
};

const formatWeekRange = (start, end) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
};

/**
 * Get supply history movement broken down per week for a specific month/year,
 * optionally filtered by product category. Each week returns all products that
 * moved within the selected category.
 */
export const getFastMovingProducts = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10);
  const category = req.query.category;

  if (!year || !month) {
    return res.status(400).json({
      success: false,
      message: "Both 'year' and 'month' query params are required.",
    });
  }

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const productQuery =
    category && category !== "all"
      ? { category: new mongoose.Types.ObjectId(category) }
      : {};

  const products = await Product.find(productQuery)
    .select("_id name")
    .lean();

  if (products.length === 0) {
    return res.json({
      success: true,
      data: [],
      meta: {
        filters: { year, month, category: category || "all" },
        series: [],
        generatedAt: new Date(),
      },
    });
  }

  const productSeries = products.map((product) => ({
    productId: product._id.toString(),
    label: product.name,
  }));

  const productIdList = products.map((product) => product._id);

  const basePipeline = [
    {
      $match: {
        supplied_at: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      },
    },
    {
      $lookup: {
        from: "productvariants",
        localField: "product_variant",
        foreignField: "_id",
        as: "variant",
      },
    },
    { $unwind: "$variant" },
    {
      $lookup: {
        from: "products",
        localField: "variant.product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  ];

  if (category && category !== "all") {
    basePipeline.push({
      $match: {
        "product._id": { $in: productIdList },
      },
    });
  }

  const weeklyPipeline = [
    ...basePipeline,
    {
      $group: {
        _id: {
          year: { $isoWeekYear: "$supplied_at" },
          week: { $isoWeek: "$supplied_at" },
          productId: "$product._id",
        },
        totalQuantity: { $sum: "$quantity" },
        productName: { $first: "$product.name" },
        lastSupplied: { $max: "$supplied_at" },
      },
    },
    {
      $group: {
        _id: {
          year: "$_id.year",
          week: "$_id.week",
        },
        totalQuantity: { $sum: "$totalQuantity" },
        products: {
          $push: {
            productId: "$_id.productId",
            name: "$productName",
            totalQuantity: "$totalQuantity",
            lastSupplied: "$lastSupplied",
          },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.week": 1 } },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        week: "$_id.week",
        totalQuantity: 1,
        products: 1,
      },
    },
  ];

  const dailyPipeline = [
    ...basePipeline,
    {
      $addFields: {
        isoYear: { $isoWeekYear: "$supplied_at" },
        isoWeek: { $isoWeek: "$supplied_at" },
        isoDay: { $subtract: [{ $isoDayOfWeek: "$supplied_at" }, 1] },
        dateParts: {
          year: { $year: "$supplied_at" },
          month: { $month: "$supplied_at" },
          day: { $dayOfMonth: "$supplied_at" },
        },
      },
    },
    {
      $group: {
        _id: {
          year: "$isoYear",
          week: "$isoWeek",
          dayIndex: "$isoDay",
          productId: "$product._id",
        },
        totalQuantity: { $sum: "$quantity" },
        dateParts: { $first: "$dateParts" },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        week: "$_id.week",
        dayIndex: "$_id.dayIndex",
        productId: "$_id.productId",
        totalQuantity: 1,
        date: {
          $dateFromParts: {
            year: "$dateParts.year",
            month: "$dateParts.month",
            day: "$dateParts.day",
          },
        },
      },
    },
    { $sort: { year: 1, week: 1, dayIndex: 1 } },
  ];

  const [weeklyResults, dailyResults] = await Promise.all([
    SupplyHistory.aggregate(weeklyPipeline),
    SupplyHistory.aggregate(dailyPipeline),
  ]);

  const dailyMap = new Map();
  dailyResults.forEach((entry) => {
    const key = `${entry.year}-${entry.week}`;
    if (!dailyMap.has(key)) {
      dailyMap.set(key, []);
    }
    dailyMap.get(key).push(entry);
  });

  // Calculate top 5 products across all weeks
  const productTotals = new Map();
  weeklyResults.forEach((entry) => {
    entry.products.forEach((product) => {
      const key = product.productId.toString();
      const current = productTotals.get(key) || 0;
      productTotals.set(key, current + product.totalQuantity);
    });
  });

  // Get top 5 products sorted by total quantity
  const top5Products = Array.from(productTotals.entries())
    .map(([productId, total]) => {
      const product = productSeries.find((p) => p.productId === productId);
      return {
        productId,
        label: product?.label || "Unknown",
        total,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const top5ProductIds = new Set(top5Products.map((p) => p.productId));
  const top5ProductSeries = top5Products.map((p) => ({
    productId: p.productId,
    label: p.label,
  }));

  const formatted = weeklyResults.map((entry) => {
    const { start, end } = getWeekRange(entry.year, entry.week);
    const weekLabel = `Week ${String(entry.week).padStart(2, "0")}`;
    const totals = top5ProductSeries.reduce((acc, product) => {
      acc[product.productId] = 0;
      return acc;
    }, {});

    entry.products
      .filter((product) => top5ProductIds.has(product.productId.toString()))
      .forEach((product) => {
        const key = product.productId.toString();
        if (key in totals) {
          totals[key] = product.totalQuantity;
        }
      });

    const weekKey = `${entry.year}-${entry.week}`;
    const weekDailyEntries = dailyMap.get(weekKey) || [];
    const dailyTotals = Array.from({ length: 7 }, (_, index) => {
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + index);

      const dayTotals = top5ProductSeries.reduce((acc, product) => {
        acc[product.productId] = 0;
        return acc;
      }, {});

      weekDailyEntries
        .filter(
          (day) =>
            day.dayIndex === index &&
            top5ProductIds.has(day.productId.toString())
        )
        .forEach((day) => {
          const key = day.productId.toString();
          if (key in dayTotals) {
            dayTotals[key] = day.totalQuantity;
          }
        });

      return {
        dayIndex: index,
        isoDate: dayDate.toISOString(),
        label: dayDate.toLocaleDateString("en-US", { weekday: "short" }),
        fullLabel: dayDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        totals: dayTotals,
      };
    });

    return {
      ...entry,
      weekLabel,
      rangeText: formatWeekRange(start, end),
      weekStart: start,
      weekEnd: end,
      products: entry.products
        .filter((product) => top5ProductIds.has(product.productId.toString()))
        .sort((a, b) => b.totalQuantity - a.totalQuantity),
      totals,
      dailyTotals,
    };
  });

  res.json({
    success: true,
    data: formatted,
    meta: {
      filters: {
        year,
        month,
        category: category || "all",
      },
      series: top5ProductSeries,
      generatedAt: new Date(),
    },
  });
});

/**
 * Get product sales movement (similar to supply movement but based on sales)
 */
export const getProductSalesMovement = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10);
  const category = req.query.category;

  if (!year || !month) {
    return res.status(400).json({
      success: false,
      message: "Both 'year' and 'month' query params are required.",
    });
  }

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const productQuery =
    category && category !== "all"
      ? { category: new mongoose.Types.ObjectId(category) }
      : {};

  const products = await Product.find(productQuery)
    .select("_id name")
    .lean();

  if (products.length === 0) {
    return res.json({
      success: true,
      data: [],
      meta: {
        filters: { year, month, category: category || "all" },
        series: [],
        generatedAt: new Date(),
      },
    });
  }

  const productSeries = products.map((product) => ({
    productId: product._id.toString(),
    label: product.name,
  }));

  const productIdList = products.map((product) => product._id);

  const basePipeline = [
    {
      $match: {
        saleDate: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      },
    },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "productvariants",
        localField: "items.productVariantId",
        foreignField: "_id",
        as: "variant",
      },
    },
    { $unwind: "$variant" },
    {
      $lookup: {
        from: "products",
        localField: "variant.product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  ];

  if (category && category !== "all") {
    basePipeline.push({
      $match: {
        "product._id": { $in: productIdList },
      },
    });
  }

  const weeklyPipeline = [
    ...basePipeline,
    {
      $group: {
        _id: {
          year: { $isoWeekYear: "$saleDate" },
          week: { $isoWeek: "$saleDate" },
          productId: "$product._id",
        },
        totalQuantity: { $sum: "$items.quantity" },
        totalSales: { $sum: "$items.subtotal" },
        productName: { $first: "$product.name" },
      },
    },
    {
      $group: {
        _id: {
          year: "$_id.year",
          week: "$_id.week",
        },
        totalQuantity: { $sum: "$totalQuantity" },
        products: {
          $push: {
            productId: "$_id.productId",
            name: "$productName",
            totalQuantity: "$totalQuantity",
            totalSales: "$totalSales",
          },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.week": 1 } },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        week: "$_id.week",
        totalQuantity: 1,
        products: 1,
      },
    },
  ];

  const dailyPipeline = [
    ...basePipeline,
    {
      $addFields: {
        isoYear: { $isoWeekYear: "$saleDate" },
        isoWeek: { $isoWeek: "$saleDate" },
        isoDay: { $subtract: [{ $isoDayOfWeek: "$saleDate" }, 1] },
        dateParts: {
          year: { $year: "$saleDate" },
          month: { $month: "$saleDate" },
          day: { $dayOfMonth: "$saleDate" },
        },
      },
    },
    {
      $group: {
        _id: {
          year: "$isoYear",
          week: "$isoWeek",
          dayIndex: "$isoDay",
          productId: "$product._id",
        },
        totalQuantity: { $sum: "$items.quantity" },
        totalSales: { $sum: "$items.subtotal" },
        dateParts: { $first: "$dateParts" },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        week: "$_id.week",
        dayIndex: "$_id.dayIndex",
        productId: "$_id.productId",
        totalQuantity: 1,
        totalSales: 1,
        date: {
          $dateFromParts: {
            year: "$dateParts.year",
            month: "$dateParts.month",
            day: "$dateParts.day",
          },
        },
      },
    },
    { $sort: { year: 1, week: 1, dayIndex: 1 } },
  ];

  const [weeklyResults, dailyResults] = await Promise.all([
    Sale.aggregate(weeklyPipeline),
    Sale.aggregate(dailyPipeline),
  ]);

  const dailyMap = new Map();
  dailyResults.forEach((entry) => {
    const key = `${entry.year}-${entry.week}`;
    if (!dailyMap.has(key)) {
      dailyMap.set(key, []);
    }
    dailyMap.get(key).push(entry);
  });

  // Calculate top 5 products across all weeks (based on total sales)
  const productTotals = new Map();
  weeklyResults.forEach((entry) => {
    entry.products.forEach((product) => {
      const key = product.productId.toString();
      const current = productTotals.get(key) || 0;
      productTotals.set(key, current + (product.totalSales || 0));
    });
  });

  // Get top 5 products sorted by total sales
  const top5Products = Array.from(productTotals.entries())
    .map(([productId, total]) => {
      const product = productSeries.find((p) => p.productId === productId);
      return {
        productId,
        label: product?.label || "Unknown",
        total,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const top5ProductIds = new Set(top5Products.map((p) => p.productId));
  const top5ProductSeries = top5Products.map((p) => ({
    productId: p.productId,
    label: p.label,
  }));

  const formatted = weeklyResults.map((entry) => {
    const { start, end } = getWeekRange(entry.year, entry.week);
    const weekLabel = `Week ${String(entry.week).padStart(2, "0")}`;
    const totals = top5ProductSeries.reduce((acc, product) => {
      acc[product.productId] = 0;
      return acc;
    }, {});
    const salesTotals = top5ProductSeries.reduce((acc, product) => {
      acc[product.productId] = 0;
      return acc;
    }, {});

    entry.products
      .filter((product) => top5ProductIds.has(product.productId.toString()))
      .forEach((product) => {
        const key = product.productId.toString();
        if (key in totals) {
          totals[key] = product.totalQuantity;
          salesTotals[key] = product.totalSales || 0;
        }
      });

    const weekKey = `${entry.year}-${entry.week}`;
    const weekDailyEntries = dailyMap.get(weekKey) || [];
    const dailyTotals = Array.from({ length: 7 }, (_, index) => {
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + index);

      const dayTotals = top5ProductSeries.reduce((acc, product) => {
        acc[product.productId] = 0;
        return acc;
      }, {});
      const daySalesTotals = top5ProductSeries.reduce((acc, product) => {
        acc[product.productId] = 0;
        return acc;
      }, {});

      weekDailyEntries
        .filter(
          (day) =>
            day.dayIndex === index &&
            top5ProductIds.has(day.productId.toString())
        )
        .forEach((day) => {
          const key = day.productId.toString();
          if (key in dayTotals) {
            dayTotals[key] = day.totalQuantity;
            daySalesTotals[key] = day.totalSales || 0;
          }
        });

      return {
        dayIndex: index,
        isoDate: dayDate.toISOString(),
        label: dayDate.toLocaleDateString("en-US", { weekday: "short" }),
        fullLabel: dayDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        totals: dayTotals,
        salesTotals: daySalesTotals,
      };
    });

    return {
      ...entry,
      weekLabel,
      rangeText: formatWeekRange(start, end),
      weekStart: start,
      weekEnd: end,
      products: entry.products
        .filter((product) => top5ProductIds.has(product.productId.toString()))
        .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0)),
      totals,
      salesTotals,
      dailyTotals,
    };
  });

  res.json({
    success: true,
    data: formatted,
    meta: {
      filters: {
        year,
        month,
        category: category || "all",
      },
      series: top5ProductSeries,
      generatedAt: new Date(),
    },
  });
});

/**
 * Get count of pending reservations (for notification badge)
 */
export const getPendingReservationCount = asyncHandler(async (req, res) => {
  const count = await Reservation.countDocuments({ status: "pending" });
  res.json({ count });
});

/**
 * Controller: getStockStatus
 *
 * Fetches product variants based on stock status (low, out, or all).
 *
 * Features:
 * - Supports:
 *   - "low"  → quantity <= 15 but > 0
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
    if (type === "low") {
      // Use per-variant lowStockThreshold when available, defaulting to 15
      query = {
        $expr: {
          $and: [
            { $gt: ["$quantity", 0] },
            {
              $lte: [
                "$quantity",
                { $ifNull: ["$lowStockThreshold", 15] },
              ],
            },
          ],
        },
      };
    }
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
 * - ?option=month   → group by week (all weeks in selected month)
 * - ?option=year    → group by month (all months in selected year)
 * - ?option=overall → group by year (total)
 * - ?year=YYYY      → required for month/year, optional for overall
 * - ?month=MM       → required for month option (1-12)
 *
 * Response format:
 * [
 *   {
 *     year: 2025,
 *     period: "Week 40" or "January" or "2025",
 *     totalSupplyCost: 5000,
 *     totalSales: 8000,
 *     difference: 3000
 *   },
 *   ...
 * ]
 */
export const getSupplyAndSalesComparison = asyncHandler(async (req, res) => {
  try {
    const option = req.query.option || "month"; // default month
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || null;
    let groupStageSupply = {};
    let matchStageSupply = {};
    let matchStageSales = {};

  if (option === "month") {
    // Filter by specific month and year, group by week (all weeks that have days in that month)
    if (!month || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: "Invalid month. Use 1-12 for month option.",
      });
    }
    
    // Filter by the exact month boundaries first
    const firstDayOfMonth = new Date(year, month - 1, 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    const lastDayOfMonth = new Date(year, month, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);
    
    // Find the Monday of the ISO week containing the first day of the month
    // This ensures we capture all weeks that might have days in the month
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToMonday = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Days to go back to Monday
    const mondayOfFirstWeek = new Date(firstDayOfMonth);
    mondayOfFirstWeek.setDate(firstDayOfMonth.getDate() - daysToMonday);
    mondayOfFirstWeek.setHours(0, 0, 0, 0);
    
    // Find the Sunday of the ISO week containing the last day of the month
    const lastDayOfWeek = lastDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToSunday = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek; // Days to go forward to Sunday
    const sundayOfLastWeek = new Date(lastDayOfMonth);
    sundayOfLastWeek.setDate(lastDayOfMonth.getDate() + daysToSunday);
    sundayOfLastWeek.setHours(23, 59, 59, 999);
    
    // Filter by the extended week range to capture all potential weeks
    // We'll filter the results later to only include weeks that belong to the selected month
    matchStageSupply = {
      supplied_at: {
        $gte: mondayOfFirstWeek,
        $lte: sundayOfLastWeek,
      },
    };
    matchStageSales = {
      saleDate: {
        $gte: mondayOfFirstWeek,
        $lte: sundayOfLastWeek,
      },
    };
    
    // Group by ISO week, but we'll filter to only include weeks with days in the selected month
    groupStageSupply = {
      _id: {
        year: { $isoWeekYear: "$supplied_at" },
        week: { $isoWeek: "$supplied_at" },
        month: { $month: "$supplied_at" },
      },
      totalSupplyCost: { $sum: "$total_cost" },
    };
  } else if (option === "year") {
    // Filter by year, group by month (all months in that year)
    matchStageSupply = {
      supplied_at: {
        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
        $lte: new Date(`${year}-12-31T23:59:59.999Z`),
      },
    };
    matchStageSales = {
      saleDate: {
        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
        $lte: new Date(`${year}-12-31T23:59:59.999Z`),
      },
    };
    groupStageSupply = {
      _id: {
        year: { $year: "$supplied_at" },
        month: { $month: "$supplied_at" },
      },
      totalSupplyCost: { $sum: "$total_cost" },
    };
  } else if (option === "overall") {
    // No date filter, group by year (total)
    matchStageSupply = {};
    matchStageSales = {};
    groupStageSupply = {
      _id: {
        year: { $year: "$supplied_at" },
      },
      totalSupplyCost: { $sum: "$total_cost" },
    };
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid option. Use 'month', 'year', or 'overall'.",
    });
  }

  // Helper function to get ISO week date range
  const getISOWeekRange = (isoYear, isoWeek) => {
    // ISO week calculation: Week 1 is the week containing Jan 4
    const jan4 = new Date(isoYear, 0, 4);
    const jan4Day = jan4.getDay() || 7; // Sunday = 7
    const mondayOfWeek1 = new Date(isoYear, 0, 4 - jan4Day + 1);
    const mondayOfThisWeek = new Date(mondayOfWeek1);
    mondayOfThisWeek.setDate(mondayOfWeek1.getDate() + (isoWeek - 1) * 7);
    mondayOfThisWeek.setHours(0, 0, 0, 0);
    
    const sundayOfThisWeek = new Date(mondayOfThisWeek);
    sundayOfThisWeek.setDate(mondayOfThisWeek.getDate() + 6);
    sundayOfThisWeek.setHours(23, 59, 59, 999);
    
    return { start: mondayOfThisWeek, end: sundayOfThisWeek };
  };

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
  let supplyAgg = await SupplyHistory.aggregate([
    ...(Object.keys(matchStageSupply).length > 0 ? [{ $match: matchStageSupply }] : []),
    { $group: groupStageSupply },
  ]);
  
  // For month option, filter to only include weeks that belong to the selected month
  // A week "belongs" to a month if the majority of its days (4 or more) are in that month
  if (option === "month") {
    const monthStart = new Date(year, month - 1, 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(year, month, 0);
    monthEnd.setHours(23, 59, 59, 999);
    
    supplyAgg = supplyAgg.filter((entry) => {
      try {
        const weekYear = entry._id?.year;
        const weekNum = entry._id?.week;
        
        if (!weekYear || !weekNum) return false;
        
        const { start, end } = getISOWeekRange(weekYear, weekNum);
        
        // Count how many days of this week fall within the selected month
        let daysInMonth = 0;
        const currentDay = new Date(start);
        
        while (currentDay <= end) {
          if (currentDay >= monthStart && currentDay <= monthEnd) {
            daysInMonth++;
          }
          currentDay.setDate(currentDay.getDate() + 1);
        }
        
        // Only include weeks where at least 4 days (majority) are in the selected month
        return daysInMonth >= 4;
      } catch (error) {
        console.error("Error filtering week:", error, entry);
        return false;
      }
    });
  }

  // --- SALES AGGREGATION WITH COGS (Cost of Goods Sold) ---
  // Use supplier_price from SupplyHistory (actual cost paid) instead of ProductVariant
  let salesAgg = await Sale.aggregate([
    ...(Object.keys(matchStageSales).length > 0 ? [{ $match: matchStageSales }] : []),
    // Unwind items to calculate COGS per item
    { $unwind: "$items" },
    // Lookup SupplyHistory to get the actual supplier_price that was paid
    // Find the most recent supply entry for this variant before or on the sale date
    {
      $lookup: {
        from: "supplyhistories",
        let: { variantId: "$items.productVariantId", saleDate: "$saleDate" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$product_variant", "$$variantId"] },
                  { $lte: ["$supplied_at", "$$saleDate"] },
                ],
              },
            },
          },
          { $sort: { supplied_at: -1 } }, // Get most recent supply entry
          { $limit: 1 },
          {
            $project: {
              supplier_price: 1,
            },
          },
        ],
        as: "supplyHistory",
      },
    },
    // Fallback to ProductVariant supplier_price if no SupplyHistory found
    {
      $lookup: {
        from: "productvariants",
        localField: "items.productVariantId",
        foreignField: "_id",
        as: "variant",
      },
    },
    { $unwind: { path: "$variant", preserveNullAndEmptyArrays: true } },
    // Calculate COGS using supplier_price from SupplyHistory (actual cost paid)
    // Fallback to ProductVariant supplier_price if SupplyHistory not found
    {
      $addFields: {
        actualSupplierPrice: {
          $ifNull: [
            { $arrayElemAt: ["$supplyHistory.supplier_price", 0] },
            { $ifNull: ["$variant.supplier_price", 0] },
          ],
        },
        itemCOGS: {
          $multiply: [
            "$items.quantity",
            {
              $ifNull: [
                { $arrayElemAt: ["$supplyHistory.supplier_price", 0] },
                { $ifNull: ["$variant.supplier_price", 0] },
              ],
            },
          ],
        },
        itemSales: {
          $multiply: ["$items.quantity", "$items.price"],
        },
        periodId: option === "month"
          ? {
              year: { $isoWeekYear: "$saleDate" },
              week: { $isoWeek: "$saleDate" },
              month: { $month: "$saleDate" },
            }
          : option === "year"
          ? {
              year: { $year: "$saleDate" },
              month: { $month: "$saleDate" },
            }
          : {
              year: { $year: "$saleDate" },
            },
      },
    },
    // Group by period and sum sales and COGS
    {
      $group: {
        _id: "$periodId",
        totalSales: { $sum: "$itemSales" },
        totalCOGS: { $sum: "$itemCOGS" },
      },
    },
  ]);
  
  // For month option, filter sales to only include weeks that belong to the selected month
  // A week "belongs" to a month if the majority of its days (4 or more) are in that month
  if (option === "month") {
    const monthStart = new Date(year, month - 1, 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(year, month, 0);
    monthEnd.setHours(23, 59, 59, 999);
    
    salesAgg = salesAgg.filter((entry) => {
      try {
        const weekYear = entry._id?.year;
        const weekNum = entry._id?.week;
        
        if (!weekYear || !weekNum) return false;
        
        const { start, end } = getISOWeekRange(weekYear, weekNum);
        
        // Count how many days of this week fall within the selected month
        let daysInMonth = 0;
        const currentDay = new Date(start);
        
        while (currentDay <= end) {
          if (currentDay >= monthStart && currentDay <= monthEnd) {
            daysInMonth++;
          }
          currentDay.setDate(currentDay.getDate() + 1);
        }
        
        // Only include weeks where at least 4 days (majority) are in the selected month
        return daysInMonth >= 4;
      } catch (error) {
        console.error("Error filtering sales week:", error, entry);
        return false;
      }
    });
  }

  // 🧩 Merge the two datasets
  const combined = [];
  const salesMap = new Map();

  // Helper function to format year period
  const formatYearPeriod = (year) => {
    return `${year}`;
  };

  // Index sales data with COGS
  for (const s of salesAgg) {
    let key;
    if (option === "month") {
      key = `${s._id.year}-${s._id.week}`;
    } else if (option === "year") {
      key = `${s._id.year}-${s._id.month}`;
    } else {
      key = `${s._id.year}`;
    }
    salesMap.set(key, {
      totalSales: s.totalSales,
      totalCOGS: s.totalCOGS || 0,
      month: s._id.month,
      week: s._id.week,
    });
  }

  // Include all supply entries
  for (const s of supplyAgg) {
    let key;
    if (option === "month") {
      key = `${s._id.year}-${s._id.week}`;
    } else if (option === "year") {
      key = `${s._id.year}-${s._id.month}`;
    } else {
      key = `${s._id.year}`;
    }
    const salesData = salesMap.get(key) || {
      totalSales: 0,
      totalCOGS: 0,
      month: s._id.month,
      week: s._id.week,
    };

    // Calculate profit as Sales - COGS (not Sales - Supply Cost)
    const profit = salesData.totalSales - (salesData.totalCOGS || 0);

    let periodLabel;
    let weekStart = null;
    let weekEnd = null;
    
    if (option === "month") {
      periodLabel = formatWeekPeriod(s._id.year, s._id.week, s._id.month);
      // Get week date range for display
      const weekRange = getISOWeekRange(s._id.year, s._id.week);
      weekStart = weekRange.start;
      weekEnd = weekRange.end;
    } else if (option === "year") {
      periodLabel = formatMonthPeriod(s._id.month);
    } else {
      periodLabel = formatYearPeriod(s._id.year);
    }

    combined.push({
      year: s._id.year,
      period: periodLabel,
      week: option === "month" ? s._id.week : null,
      month: option === "year" ? s._id.month : (option === "overall" ? null : s._id.month),
      weekStart: weekStart ? weekStart.toISOString() : null,
      weekEnd: weekEnd ? weekEnd.toISOString() : null,
      totalSupplyCost: s.totalSupplyCost,
      totalSales: salesData.totalSales,
      totalCOGS: salesData.totalCOGS || 0,
      difference: profit, // Profit = Sales - COGS
    });
    salesMap.delete(key);
  }

  // Include sales-only periods (no supply)
  for (const [key, salesData] of salesMap.entries()) {
    // Calculate profit as Sales - COGS
    const profit = salesData.totalSales - (salesData.totalCOGS || 0);

    let periodLabel;
    let yearInt, weekInt, monthInt;
    let weekStart = null;
    let weekEnd = null;

    if (option === "month") {
      const [yr, week] = key.split("-");
      yearInt = parseInt(yr);
      weekInt = parseInt(week);
      periodLabel = formatWeekPeriod(yearInt, weekInt, salesData.month);
      // Get week date range for display
      const weekRange = getISOWeekRange(yearInt, weekInt);
      weekStart = weekRange.start;
      weekEnd = weekRange.end;
    } else if (option === "year") {
      const [yr, mon] = key.split("-");
      yearInt = parseInt(yr);
      monthInt = parseInt(mon);
      periodLabel = formatMonthPeriod(monthInt);
    } else {
      yearInt = parseInt(key);
      periodLabel = formatYearPeriod(yearInt);
    }

    combined.push({
      year: yearInt,
      period: periodLabel,
      week: option === "month" ? weekInt : null,
      month: option === "year" ? monthInt : (option === "overall" ? null : salesData.month),
      weekStart: weekStart ? weekStart.toISOString() : null,
      weekEnd: weekEnd ? weekEnd.toISOString() : null,
      totalSupplyCost: 0,
      totalSales: salesData.totalSales,
      totalCOGS: salesData.totalCOGS || 0,
      difference: profit,
    });
  }

  // Sort results
  combined.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (option === "month" && a.week !== b.week) {
      return (a.week || 0) - (b.week || 0);
    }
    if (option === "year" && a.month !== b.month) {
      return (a.month || 0) - (b.month || 0);
    }
    return 0;
  });

    res.json({
      success: true,
      option,
      year: option !== "overall" ? year : null,
      month: option === "month" ? month : null,
      data: combined,
    });
  } catch (error) {
    console.error("Error in getSupplyAndSalesComparison:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
