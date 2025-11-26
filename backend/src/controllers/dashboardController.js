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
 * Get overall sales statistics since business start
 * Returns total sales and total number of sales records
 */
export const getOverallSalesStats = asyncHandler(async (req, res) => {
  const result = await Sale.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalPrice" },
        totalCount: { $sum: 1 },
      },
    },
  ]);

  const stats = result.length > 0 
    ? { 
        totalSales: result[0].totalSales || 0, 
        totalCount: result[0].totalCount || 0 
      }
    : { 
        totalSales: 0, 
        totalCount: 0 
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

  const formatted = weeklyResults.map((entry) => {
    const { start, end } = getWeekRange(entry.year, entry.week);
    const weekLabel = `Week ${String(entry.week).padStart(2, "0")}`;
    const totals = productSeries.reduce((acc, product) => {
      acc[product.productId] = 0;
      return acc;
    }, {});

    entry.products.forEach((product) => {
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

      const dayTotals = productSeries.reduce((acc, product) => {
        acc[product.productId] = 0;
        return acc;
      }, {});

      weekDailyEntries
        .filter((day) => day.dayIndex === index)
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
      products: entry.products.sort(
        (a, b) => b.totalQuantity - a.totalQuantity
      ),
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
      series: productSeries,
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

  const formatted = weeklyResults.map((entry) => {
    const { start, end } = getWeekRange(entry.year, entry.week);
    const weekLabel = `Week ${String(entry.week).padStart(2, "0")}`;
    const totals = productSeries.reduce((acc, product) => {
      acc[product.productId] = 0;
      return acc;
    }, {});
    const salesTotals = productSeries.reduce((acc, product) => {
      acc[product.productId] = 0;
      return acc;
    }, {});

    entry.products.forEach((product) => {
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

      const dayTotals = productSeries.reduce((acc, product) => {
        acc[product.productId] = 0;
        return acc;
      }, {});
      const daySalesTotals = productSeries.reduce((acc, product) => {
        acc[product.productId] = 0;
        return acc;
      }, {});

      weekDailyEntries
        .filter((day) => day.dayIndex === index)
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
      products: entry.products.sort(
        (a, b) => (b.totalSales || 0) - (a.totalSales || 0)
      ),
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
      series: productSeries,
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
    if (type === "low") query = { quantity: { $gt: 0, $lt: 15 } };
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

  if (option === "weekly") {
    // ----- WEEKLY AGGREGATION FOR SUPPLY -----
    groupStageSupply = {
      _id: {
        year: { $isoWeekYear: "$supplied_at" },
        week: { $isoWeek: "$supplied_at" },
        month: { $month: "$supplied_at" },
      },
      totalSupplyCost: { $sum: "$total_cost" },
    };
  } else if (option === "monthly") {
    // ----- MONTHLY AGGREGATION FOR SUPPLY -----
    groupStageSupply = {
      _id: {
        year: { $year: "$supplied_at" },
        month: { $month: "$supplied_at" },
      },
      totalSupplyCost: { $sum: "$total_cost" },
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

  // --- SALES AGGREGATION WITH COGS (Cost of Goods Sold) ---
  // Use supplier_price from SupplyHistory (actual cost paid) instead of ProductVariant
  const salesAgg = await Sale.aggregate([
    {
      $match: {
        saleDate: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${year}-12-31T23:59:59.999Z`),
        },
      },
    },
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
        periodId: option === "weekly"
          ? {
              year: { $isoWeekYear: "$saleDate" },
              week: { $isoWeek: "$saleDate" },
              month: { $month: "$saleDate" },
            }
          : {
              year: { $year: "$saleDate" },
              month: { $month: "$saleDate" },
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

  // 🧩 Merge the two datasets
  const combined = [];
  const salesMap = new Map();

  // Index sales data with COGS
  for (const s of salesAgg) {
    const key =
      option === "weekly"
        ? `${s._id.year}-${s._id.week}`
        : `${s._id.year}-${s._id.month}`;
    salesMap.set(key, {
      totalSales: s.totalSales,
      totalCOGS: s.totalCOGS || 0,
      month: s._id.month,
    });
  }

  // Include all supply entries
  for (const s of supplyAgg) {
    const key =
      option === "weekly"
        ? `${s._id.year}-${s._id.week}`
        : `${s._id.year}-${s._id.month}`;
    const salesData = salesMap.get(key) || {
      totalSales: 0,
      totalCOGS: 0,
      month: s._id.month,
    };

    // Calculate profit as Sales - COGS (not Sales - Supply Cost)
    const profit = salesData.totalSales - (salesData.totalCOGS || 0);

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
      totalCOGS: salesData.totalCOGS || 0,
      difference: profit, // Profit = Sales - COGS
    });
    salesMap.delete(key);
  }

  // Include sales-only periods (no supply)
  for (const [key, salesData] of salesMap.entries()) {
    const [yr, periodNum] = key.split("-");
    const yearInt = parseInt(yr);
    const periodInt = parseInt(periodNum);

    // Calculate profit as Sales - COGS
    const profit = salesData.totalSales - (salesData.totalCOGS || 0);

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
      totalCOGS: salesData.totalCOGS || 0,
      difference: profit, // Profit = Sales - COGS
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
