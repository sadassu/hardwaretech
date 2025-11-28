import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useLiveResourceRefresh } from "../../hooks/useLiveResourceRefresh";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, AlertCircle } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";
import SalesCards from "./SalesCards";
import StockCards from "./StockCards";
import { formatDatePHT } from "../../utils/formatDate";
import SupplyHistoryCard from "./SupplyHistoryCard";
import SalesSupplyHistoryGraph from "./SalesSupplyHistoryGraph";
import { useCategoriesStore } from "../../store/categoriesStore";

const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const SUPPLY_COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#0ea5e9",
  "#f97316",
  "#22c55e",
  "#d946ef",
  "#14b8a6",
];

const reorderForColumns = (items = [], columns = 3) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const perColumn = Math.ceil(items.length / columns);
  const columnsData = Array.from({ length: columns }, (_, col) =>
    items.slice(col * perColumn, (col + 1) * perColumn)
  );
  const reordered = [];

  for (let row = 0; row < perColumn; row++) {
    for (let col = 0; col < columns; col++) {
      const value = columnsData[col][row];
      if (value) reordered.push(value);
    }
  }
  return reordered;
};

function Dashboard() {
  const [option, setOption] = useState("daily");
  const currentDate = new Date();
  const [supplyYear, setSupplyYear] = useState(currentDate.getFullYear());
  const [supplyMonth, setSupplyMonth] = useState(currentDate.getMonth() + 1);
  const [supplyCategory, setSupplyCategory] = useState("all");
  const [supplyWeek, setSupplyWeek] = useState("all");
  const [selectedSupplyBar, setSelectedSupplyBar] = useState(null);
  const [salesYear, setSalesYear] = useState(currentDate.getFullYear());
  const [salesMonth, setSalesMonth] = useState(currentDate.getMonth() + 1);
  const [salesCategory, setSalesCategory] = useState("all");
  const [salesWeek, setSalesWeek] = useState("all");
  const [selectedSalesBar, setSelectedSalesBar] = useState(null);
  const supplyModalProducts = useMemo(
    () => reorderForColumns(selectedSupplyBar?.products || [], 3),
    [selectedSupplyBar]
  );
  const salesModalProducts = useMemo(
    () => reorderForColumns(selectedSalesBar?.products || [], 3),
    [selectedSalesBar]
  );
  const yearOptions = useMemo(() => {
    const latest = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, idx) => latest - idx);
  }, []);
  const selectedSupplyMonthLabel =
    MONTH_OPTIONS.find((month) => month.value === supplyMonth)?.label ||
    "Month";
  const selectedSalesMonthLabel =
    MONTH_OPTIONS.find((month) => month.value === salesMonth)?.label ||
    "Month";
  const { user } = useAuthContext();
  const categories = useCategoriesStore((state) => state.categories);
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);
  const categoriesLoading = useCategoriesStore((state) => state.loading);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  const salesLiveKey = useLiveResourceRefresh([
    "dashboard",
    "sales",
    "reservations",
  ]);
  const supplyLiveKey = useLiveResourceRefresh(["supply", "inventory"]);

  const {
    data: salesData,
    loading,
    error,
  } = useFetch(
    "dashboard/sales",
    {
      params: { option },
      headers: { Authorization: `Bearer ${user.token}` },
    },
    [option, salesLiveKey]
  );

  // Fetch overall sales since business start
  const commonHeaders = user?.token
    ? {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    : null;

  const {
    data: overallStats,
    loading: overallLoading,
  } = useFetch(
    user?.token ? "dashboard/sales/overall" : null,
    commonHeaders || {},
    [user?.token, salesLiveKey]
  );

  const supplyParams = {
    year: supplyYear,
    month: supplyMonth,
  };
  if (supplyCategory && supplyCategory !== "all") {
    supplyParams.category = supplyCategory;
  }

  const {
    data: fastMovingData,
    loading: fastMovingLoading,
    error: fastMovingError,
  } = useFetch(
    user?.token ? "dashboard/supply/fast-moving" : null,
    {
      ...(commonHeaders || {}),
      params: supplyParams,
    },
    [user?.token, supplyYear, supplyMonth, supplyCategory, supplyLiveKey]
  );

  const salesMovementParams = {
    year: salesYear,
    month: salesMonth,
  };
  if (salesCategory && salesCategory !== "all") {
    salesMovementParams.category = salesCategory;
  }

  const {
    data: productSalesMovement,
    loading: productSalesLoading,
    error: productSalesError,
  } = useFetch(
    user?.token ? "dashboard/sales/product-movement" : null,
    {
      ...(commonHeaders || {}),
      params: salesMovementParams,
    },
    [user?.token, salesYear, salesMonth, salesCategory, salesLiveKey]
  );

  const handleOptionChange = (e) => setOption(e.target.value);

  // Total sales for the selected filter period
  const periodTotalSales =
    salesData?.reduce((sum, item) => sum + (item.totalSales || 0), 0) || 0;
  
  // Overall sales since business start
  const overallTotalSales = overallStats?.totalSales || 0;
  
  // Average sales since business start (total sales / total count of sales)
  const overallAverageSales = overallStats?.totalCount > 0 
    ? (overallTotalSales / overallStats.totalCount).toFixed(2) 
    : 0;

  // Calculate summary statistics
  const getStatsSummary = () => {
    if (!salesData || salesData.length === 0) return null;

    const sortedData = [...salesData].sort(
      (a, b) => b.totalSales - a.totalSales
    );
    const highestSale = sortedData[0];
    const lowestSale = sortedData[sortedData.length - 1];

    // Total sales for the selected filter period (replaces trend)
    const periodTotal = periodTotalSales;

    return {
      highest: highestSale,
      lowest: lowestSale,
      periodTotal: periodTotal,
    };
  };

  const statsSummary = getStatsSummary();
  const supplyHistoryData = fastMovingData?.data || [];
  const supplySeries = fastMovingData?.meta?.series || [];
  const salesHistoryData = productSalesMovement?.data || [];
  const salesSeries = productSalesMovement?.meta?.series || [];
  const supplyWeekOptions = useMemo(() => {
    if (!supplyHistoryData || supplyHistoryData.length === 0) return [];
    return supplyHistoryData.map((week) => ({
      value: `${week.year}-${week.week}`,
      label: week.weekLabel,
      rangeText: week.rangeText,
    }));
  }, [supplyHistoryData]);

  const selectedSupplyWeekMeta = useMemo(() => {
    if (supplyWeek === "all") return null;
    return supplyWeekOptions.find((option) => option.value === supplyWeek) || null;
  }, [supplyWeekOptions, supplyWeek]);

  useEffect(() => {
    if (
      supplyWeek !== "all" &&
      !supplyWeekOptions.some((option) => option.value === supplyWeek)
    ) {
      setSupplyWeek("all");
    }
  }, [supplyWeekOptions, supplyWeek]);

  useEffect(() => {
    setSelectedSupplyBar(null);
  }, [supplyWeek, supplyMonth, supplyYear, supplyCategory, fastMovingData]);

  const supplyFilteredWeeks = useMemo(() => {
    if (!supplyHistoryData || supplyHistoryData.length === 0) return [];
    if (supplyWeek === "all") return supplyHistoryData;
    return supplyHistoryData.filter(
      (week) => `${week.year}-${week.week}` === supplyWeek
    );
  }, [supplyHistoryData, supplyWeek]);

  const { supplyChartData, supplyChartMeta } = useMemo(() => {
    if (!supplyFilteredWeeks || supplyFilteredWeeks.length === 0 || supplySeries.length === 0) {
      return { supplyChartData: [], supplyChartMeta: {} };
    }

    if (supplyWeek === "all") {
      const weeklyRows = supplyFilteredWeeks.map((week) => {
        const base = {
          label: week.weekLabel,
          rangeText: week.rangeText,
        };

        supplySeries.forEach((series) => {
          base[series.productId] =
            week.totals?.[series.productId] ?? 0;
        });

        return {
          data: base,
          meta: {
            title: week.weekLabel,
            subtitle: week.rangeText,
          },
        };
      });

      const metaMap = {};
      const chartData = weeklyRows.map((row) => {
        metaMap[row.data.label] = row.meta;
        return row.data;
      });

      return { supplyChartData: chartData, supplyChartMeta: metaMap };
    }

    const selectedWeek = supplyFilteredWeeks[0];
    if (!selectedWeek?.dailyTotals) {
      return { supplyChartData: [], supplyChartMeta: {} };
    }

    const dailyRows = selectedWeek.dailyTotals.map((day) => {
      const base = {
        label: day.label,
        rangeText: day.fullLabel,
      };

      supplySeries.forEach((series) => {
        base[series.productId] = day.totals?.[series.productId] ?? 0;
      });

      return {
        data: base,
        meta: {
          title: `${day.label} (${day.fullLabel})`,
          subtitle: day.fullLabel,
        },
      };
    });

    const metaMap = {};
    const chartData = dailyRows.map((row) => {
      metaMap[row.data.label] = row.meta;
      return row.data;
    });

    return { supplyChartData: chartData, supplyChartMeta: metaMap };
  }, [supplyFilteredWeeks, supplySeries, supplyWeek]);

  const salesWeekOptions = useMemo(() => {
    if (!salesHistoryData || salesHistoryData.length === 0) return [];
    return salesHistoryData.map((week) => ({
      value: `${week.year}-${week.week}`,
      label: week.weekLabel,
      rangeText: week.rangeText,
    }));
  }, [salesHistoryData]);

  const selectedSalesWeekMeta = useMemo(() => {
    if (salesWeek === "all") return null;
    return salesWeekOptions.find((option) => option.value === salesWeek) || null;
  }, [salesWeekOptions, salesWeek]);

  useEffect(() => {
    if (
      salesWeek !== "all" &&
      !salesWeekOptions.some((option) => option.value === salesWeek)
    ) {
      setSalesWeek("all");
    }
  }, [salesWeekOptions, salesWeek]);

  useEffect(() => {
    setSelectedSalesBar(null);
  }, [salesWeek, salesMonth, salesYear, salesCategory, productSalesMovement]);

  const salesFilteredWeeks = useMemo(() => {
    if (!salesHistoryData || salesHistoryData.length === 0) return [];
    if (salesWeek === "all") return salesHistoryData;
    return salesHistoryData.filter(
      (week) => `${week.year}-${week.week}` === salesWeek
    );
  }, [salesHistoryData, salesWeek]);

  const { salesChartData, salesChartMeta } = useMemo(() => {
    if (!salesFilteredWeeks || salesFilteredWeeks.length === 0 || salesSeries.length === 0) {
      return { salesChartData: [], salesChartMeta: {} };
    }

    if (salesWeek === "all") {
      const weeklyRows = salesFilteredWeeks.map((week) => {
        const base = {
          label: week.weekLabel,
          rangeText: week.rangeText,
        };

        salesSeries.forEach((series) => {
          base[series.productId] =
            week.salesTotals?.[series.productId] ?? 0;
        });

        return {
          data: base,
          meta: {
            title: week.weekLabel,
            subtitle: week.rangeText,
          },
        };
      });

      const metaMap = {};
      const chartData = weeklyRows.map((row) => {
        metaMap[row.data.label] = row.meta;
        return row.data;
      });

      return { salesChartData: chartData, salesChartMeta: metaMap };
    }

    const selectedWeek = salesFilteredWeeks[0];
    if (!selectedWeek?.dailyTotals) {
      return { salesChartData: [], salesChartMeta: {} };
    }

    const dailyRows = selectedWeek.dailyTotals.map((day) => {
      const base = {
        label: day.label,
        rangeText: day.fullLabel,
      };

      salesSeries.forEach((series) => {
        base[series.productId] = day.salesTotals?.[series.productId] ?? 0;
      });

      return {
        data: base,
        meta: {
          title: `${day.label} (${day.fullLabel})`,
          subtitle: day.fullLabel,
        },
      };
    });

    const metaMap = {};
    const chartData = dailyRows.map((row) => {
      metaMap[row.data.label] = row.meta;
      return row.data;
    });

    return { salesChartData: chartData, salesChartMeta: metaMap };
  }, [salesFilteredWeeks, salesSeries, salesWeek]);

  // Generate concise sales trend summary sentence
  const salesTrendSummary = useMemo(() => {
    if (!salesData || salesData.length < 2 || !statsSummary) return null;

    const chronological = [...salesData];
    const firstPoint = chronological[0];
    const lastPoint = chronological[chronological.length - 1];
    const avgSale =
      statsSummary.periodTotal && salesData.length
        ? statsSummary.periodTotal / salesData.length
        : 0;
    const percentChange =
      firstPoint.totalSales > 0
        ? ((lastPoint.totalSales - firstPoint.totalSales) /
            firstPoint.totalSales) *
          100
        : null;

    const optionLabel =
      option === "daily"
        ? "days"
        : option === "monthly"
        ? "months"
        : "years";

    if (percentChange !== null) {
      const trendStrength = Math.abs(percentChange) > 10 ? "strong" : Math.abs(percentChange) > 5 ? "moderate" : "slight";
      const direction = percentChange >= 0 ? "increasing" : "decreasing";
      return `Sales are ${direction} with a ${trendStrength} ${Math.abs(percentChange).toFixed(1)}% ${direction === "increasing" ? "growth" : "decline"} over the selected ${optionLabel}, indicating ${direction === "increasing" ? "positive" : "challenging"} business momentum.`;
    } else {
      const direction = lastPoint.totalSales >= firstPoint.totalSales ? "improving" : "declining";
      return `Sales show an ${direction} trajectory, with recent performance ${lastPoint.totalSales >= avgSale ? "above" : "below"} the period average, suggesting ${direction === "improving" ? "favorable" : "needs attention"} market conditions.`;
    }
  }, [salesData, statsSummary, option]);

  const salesNarrative = useMemo(() => {
    if (!statsSummary || !salesData?.length) return [];

    const lines = [];
    const avgSale =
      statsSummary.periodTotal && salesData.length
        ? statsSummary.periodTotal / salesData.length
        : 0;
    const optionLabel =
      option === "daily"
        ? "day"
        : option === "monthly"
        ? "month"
        : "year";

    lines.push(
      `Highest ${optionLabel} recorded ${formatPrice(
        statsSummary.highest.totalSales
      )} on ${formatDatePHT(statsSummary.highest.period)}.`
    );
    lines.push(
      `Lowest ${optionLabel} recorded ${formatPrice(
        statsSummary.lowest.totalSales
      )} on ${formatDatePHT(statsSummary.lowest.period)}.`
    );
    lines.push(
      `Total sales for this period reached ${formatPrice(
        statsSummary.periodTotal
      )} across ${salesData.length} ${optionLabel}${salesData.length > 1 ? "s" : ""}, averaging ${formatPrice(
        avgSale
      )} per ${optionLabel}.`
    );

    return lines;
  }, [statsSummary, salesData, option]);

  // Supply History Movement Interpretation
  const supplyInterpretation = useMemo(() => {
    if (!supplyChartData || supplyChartData.length === 0 || supplySeries.length === 0) {
      return [];
    }

    const lines = [];
    const allProducts = supplySeries.map(s => s.productId);
    
    // Calculate total supply for the period
    const totalSupply = supplyChartData.reduce((sum, week) => {
      return sum + allProducts.reduce((weekSum, productId) => {
        return weekSum + (Number(week[productId] || 0));
      }, 0);
    }, 0);

    // Find top products by total supply
    const productTotals = allProducts.map(productId => {
      const total = supplyChartData.reduce((sum, week) => {
        return sum + (Number(week[productId] || 0));
      }, 0);
      const product = supplySeries.find(s => s.productId === productId);
      return {
        productId,
        label: product?.label || "Unknown",
        total
      };
    }).sort((a, b) => b.total - a.total);

    const topProduct = productTotals[0];
    const periodLabel = supplyWeek === "all" 
      ? `${supplyChartData.length} week${supplyChartData.length > 1 ? "s" : ""}`
      : "selected week";

    if (topProduct && topProduct.total > 0) {
      lines.push(
        `Total supply recorded ${totalSupply.toLocaleString()} units across ${periodLabel} for ${supplySeries.length} product${supplySeries.length > 1 ? "s" : ""}.`
      );
      lines.push(
        `${topProduct.label} had the highest supply with ${topProduct.total.toLocaleString()} units, indicating strong inventory movement.`
      );
      
      if (productTotals.length > 1) {
        const secondProduct = productTotals[1];
        if (secondProduct.total > 0) {
          lines.push(
            `${secondProduct.label} followed with ${secondProduct.total.toLocaleString()} units.`
          );
        }
      }
    } else {
      lines.push("No supply movement recorded for this period.");
    }

    return lines;
  }, [supplyChartData, supplySeries, supplyWeek]);

  // Product Sales Movement Interpretation
  const salesMovementInterpretation = useMemo(() => {
    if (!salesChartData || salesChartData.length === 0 || salesSeries.length === 0) {
      return [];
    }

    const lines = [];
    const allProducts = salesSeries.map((s) => s.productId);
    const useDailyBreakdown = salesWeek !== "all";

    const productStats = allProducts
      .map((productId) => {
      let units = 0;
      let revenue = 0;
      
        salesFilteredWeeks.forEach((week) => {
          if (useDailyBreakdown && Array.isArray(week.dailyTotals)) {
            week.dailyTotals.forEach((day) => {
              units += Number(day.totals?.[productId] || 0);
              revenue += Number(day.salesTotals?.[productId] || 0);
            });
          } else {
            units += Number(week.totals?.[productId] || 0);
            revenue += Number(week.salesTotals?.[productId] || 0);
            }
          });

        const product = salesSeries.find((s) => s.productId === productId);
      return {
        productId,
        label: product?.label || "Unknown",
        units,
          revenue,
      };
      })
      .sort((a, b) => b.revenue - a.revenue);

    const totalUnits = productStats.reduce((sum, item) => sum + item.units, 0);
    const totalRevenue = productStats.reduce(
      (sum, item) => sum + item.revenue,
      0
    );

    const topProduct = productStats[0];
    const periodLabel = salesWeek === "all" 
      ? `${salesChartData.length} week${salesChartData.length > 1 ? "s" : ""}`
      : "selected week";

    if (topProduct && topProduct.revenue > 0) {
      lines.push(
        `Total sales reached ${totalUnits.toLocaleString()} units generating ₱${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in revenue across ${periodLabel} for ${salesSeries.length} product${salesSeries.length > 1 ? "s" : ""}.`
      );
      lines.push(
        `${topProduct.label} was the best-selling product with ${topProduct.units.toLocaleString()} units sold (₱${topProduct.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}), showing strong customer demand.`
      );
      
      if (productStats.length > 1) {
        const secondProduct = productStats[1];
        if (secondProduct.revenue > 0) {
          lines.push(
            `${secondProduct.label} followed with ${secondProduct.units.toLocaleString()} units sold (₱${secondProduct.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).`
          );
        }
      }
    } else {
      lines.push("No sales movement recorded for this period.");
    }

    return lines;
  }, [salesChartData, salesSeries, salesWeek, salesFilteredWeeks]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-600 text-sm">{`Period: ${formatDatePHT(
            label
          )}`}</p>
          <p className="text-blue-600 font-semibold">
            {`Sales: ${formatPrice(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const SupplyHistoryTooltip = ({ active, label }) => {
    if (!active) return null;
    const meta = supplyChartMeta[label];

  return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg min-w-[220px] -translate-y-2">
        <p className="text-xs font-semibold text-gray-700">
          {meta?.title || label}
        </p>
        {meta?.subtitle && (
          <p className="text-xs text-gray-500 mb-2">{meta.subtitle}</p>
        )}
        <p className="text-[11px] text-gray-500 italic">
          Click any bar to view the full product list.
        </p>
      </div>
    );
  };

  const openSupplyDetailsFromPayload = useCallback(
    (payload) => {
      if (!payload?.label) return;

      const products = supplySeries
        .map((series) => ({
          productId: series.productId,
          label: series.label,
          value: Number(payload[series.productId] || 0),
        }))
        .sort((a, b) => b.value - a.value);

      setSelectedSupplyBar({
        label: supplyChartMeta[payload.label]?.title || payload.label,
        subtitle: supplyChartMeta[payload.label]?.subtitle || payload.rangeText,
        products,
      });
    },
    [supplyChartMeta, supplySeries]
  );

  const handleSupplyBarClick = useCallback(
    (barProps) => {
      if (!barProps?.payload) return;
      openSupplyDetailsFromPayload(barProps.payload);
    },
    [openSupplyDetailsFromPayload]
  );

  const handleSupplyQuickView = useCallback(
    (row) => {
      openSupplyDetailsFromPayload(row);
    },
    [openSupplyDetailsFromPayload]
  );

  const closeSupplyBarDetails = useCallback(() => {
    setSelectedSupplyBar(null);
  }, []);

  // Helper function to get color for a product in supply series
  const getSupplyProductColor = useCallback(
    (productId) => {
      const index = supplySeries.findIndex(
        (series) => series.productId === productId
      );
      return index >= 0
        ? SUPPLY_COLORS[index % SUPPLY_COLORS.length]
        : "#9ca3af"; // gray fallback
    },
    [supplySeries]
  );

  // Helper function to get color for a product in sales series
  const getSalesProductColor = useCallback(
    (productId) => {
      const index = salesSeries.findIndex(
        (series) => series.productId === productId
      );
      return index >= 0
        ? SUPPLY_COLORS[index % SUPPLY_COLORS.length]
        : "#9ca3af"; // gray fallback
    },
    [salesSeries]
  );

  const openSalesDetailsFromPayload = useCallback(
    (payload) => {
      if (!payload?.label) return;

      const weekData =
        salesFilteredWeeks.find(
          (week) =>
            week.weekLabel === payload.label ||
            week.rangeText === payload.rangeText
        ) || salesFilteredWeeks[0];
      const dayData = weekData?.dailyTotals?.find(
        (day) => day.label === payload.label
      );

      const products = salesSeries
        .map((series) => {
          const salesAmount = Number(payload[series.productId] || 0);
          let quantity = 0;
          if (dayData?.totals) {
            quantity = Number(dayData.totals[series.productId] || 0);
          } else if (weekData?.totals) {
            quantity = Number(weekData.totals[series.productId] || 0);
          }
          
          return {
            productId: series.productId,
            label: series.label,
            units: quantity,
            salesAmount,
          };
        })
        .sort((a, b) => b.salesAmount - a.salesAmount);

      setSelectedSalesBar({
        label: salesChartMeta[payload.label]?.title || payload.label,
        subtitle: salesChartMeta[payload.label]?.subtitle || payload.rangeText,
        products,
      });
    },
    [salesChartMeta, salesSeries, salesFilteredWeeks]
  );

  const handleSalesBarClick = useCallback(
    (barProps) => {
      if (!barProps?.payload) return;
      openSalesDetailsFromPayload(barProps.payload);
    },
    [openSalesDetailsFromPayload]
  );

  const handleSalesQuickView = useCallback(
    (row) => {
      openSalesDetailsFromPayload(row);
    },
    [openSalesDetailsFromPayload]
  );

  const closeSalesBarDetails = useCallback(() => {
    setSelectedSalesBar(null);
  }, []);

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-600 rounded-xl shadow-md flex-shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                  Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Live overview of sales, stock, and reservations
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* LEFT (2/3) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Stats Cards */}
            <SalesCards
              salesData={salesData}
              loading={loading || overallLoading}
              totalSales={overallTotalSales}
              averageSales={overallAverageSales}
              totalDataPoints={overallStats?.totalCount || 0}
            />

            {/* Main Chart Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              {/* Chart Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                    Sales Trends
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    View your sales performance over different time periods
                  </p>
                </div>

                {/* Option Selector */}
                <div className="w-full sm:w-auto">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 sm:hidden">
                    Time Period
                  </label>
                  <div className="relative">
                    <select
                      value={option}
                      onChange={handleOptionChange}
                      className="appearance-none w-full sm:w-auto bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-xs sm:text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="daily">Daily (last 14 days)</option>
                      <option value="monthly">Monthly (current year)</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Content */}
              <div className="relative">
                {loading && (
                  <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-gray-500">Loading sales data...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="p-4 bg-red-100 rounded-full">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                      </div>
                      <div>
                        <p className="text-red-600 font-semibold mb-1">
                          Error loading data
                        </p>
                        <p className="text-gray-500 text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {salesData && salesData.length > 0 && !loading && (
                  <div className="h-64 sm:h-80 lg:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={salesData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="period"
                          stroke="#6b7280"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                          width={50}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="totalSales"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                          activeDot={{
                            r: 6,
                            stroke: "#2563eb",
                            strokeWidth: 2,
                            fill: "#ffffff",
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {                !loading && salesData?.length === 0 && (
                  <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <BarChart3 className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-600 font-semibold mb-1">
                          No data available
                        </p>
                        <p className="text-gray-500 text-sm">
                          No sales data found for this period.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Statistics */}
              {statsSummary && salesData && salesData.length > 0 && !loading && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Period Summary
                  </h3>
                  
                  {/* Top Row - 2 Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {/* Highest Sale */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border border-green-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <p className="text-xs text-gray-600 font-medium">
                          Highest Sale
                        </p>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-green-600 mb-0.5">
                        {formatPrice(statsSummary.highest.totalSales)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {formatDatePHT(statsSummary.highest.period)}
                      </p>
                    </div>

                    {/* Lowest Sale */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 sm:p-4 border border-orange-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <p className="text-xs text-gray-600 font-medium">
                          Lowest Sale
                        </p>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-orange-600 mb-0.5">
                        {formatPrice(statsSummary.lowest.totalSales)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {formatDatePHT(statsSummary.lowest.period)}
                      </p>
                    </div>
                    </div>

                  {/* Bottom Row - 3 Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {/* Average Sale */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 sm:p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-xs text-gray-600 font-medium">
                          Average Sale
                        </p>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-blue-600 mb-0.5">
                        {formatPrice(overallAverageSales)}
                      </p>
                      <p className="text-xs text-gray-500">Since business start</p>
                    </div>

                    {/* Total Sales (Period) */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 sm:p-4 border border-purple-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <p className="text-xs text-gray-600 font-medium">
                          Total Sales
                        </p>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-purple-600 mb-0.5">
                        {formatPrice(statsSummary.periodTotal)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {option === "daily" ? "Last 14 days" : option === "monthly" ? "This year" : "All years"}
                      </p>
                    </div>

                    {/* Data Points (Period) */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-3 sm:p-4 border border-indigo-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <p className="text-xs text-gray-600 font-medium">
                          Data Points
                        </p>
                  </div>
                      <p className="text-lg sm:text-xl font-bold text-indigo-600 mb-0.5">
                        {salesData.length}
                      </p>
                      <p className="text-xs text-gray-500">
                        {option === "daily" ? "Days" : option === "monthly" ? "Months" : "Years"}
                      </p>
                    </div>
                  </div>

                  {salesNarrative.length > 0 && (
                    <div className="mt-5 rounded-xl border border-dashed border-blue-200 bg-blue-50/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-3">
                        Automatic Interpretation
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {salesNarrative.map((line, idx) => (
                          <li key={idx} className="leading-relaxed">
                            • {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <SalesSupplyHistoryGraph />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Supply History Movement
                  </h3>
                  <p className="text-xs text-gray-500">
                    Weekly product movement for {selectedSupplyMonthLabel} {supplyYear}
                    {selectedSupplyWeekMeta
                      ? ` • ${selectedSupplyWeekMeta.label}`
                      : ""}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">
                      Category
                    </label>
                    <select
                      value={supplyCategory}
                      onChange={(e) => setSupplyCategory(e.target.value)}
                      disabled={categoriesLoading && categories.length === 0}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="all">All categories</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">
                      Year
                    </label>
                    <select
                      value={supplyYear}
                      onChange={(e) => setSupplyYear(parseInt(e.target.value, 10))}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {yearOptions.map((yearOption) => (
                        <option key={yearOption} value={yearOption}>
                          {yearOption}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">
                      Month
                    </label>
                    <select
                      value={supplyMonth}
                      onChange={(e) => setSupplyMonth(parseInt(e.target.value, 10))}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {MONTH_OPTIONS.map((monthOption) => (
                        <option key={monthOption.value} value={monthOption.value}>
                          {monthOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">
                      Week
                    </label>
                    <select
                      value={supplyWeek}
                      onChange={(e) => setSupplyWeek(e.target.value)}
                      disabled={supplyWeekOptions.length === 0}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="all">All weeks</option>
                      {supplyWeekOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}{" "}
                          {option.rangeText ? `(${option.rangeText})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {fastMovingLoading && (
                <div className="h-64 flex items-center justify-center text-sm text-gray-500">
                  Loading weekly movement...
                </div>
              )}

              {fastMovingError && (
                <div className="text-sm text-red-500">{fastMovingError}</div>
              )}

              {!fastMovingLoading &&
                !fastMovingError &&
                supplySeries.length === 0 && (
                  <div className="h-64 flex items-center justify-center text-sm text-gray-500">
                    No products found for this selection.
                  </div>
                )}

              {!fastMovingLoading &&
                !fastMovingError &&
                supplySeries.length > 0 &&
                supplyChartData.length === 0 && (
                  <div className="h-64 flex items-center justify-center text-sm text-gray-500">
                    No supply movement recorded for this selection.
                  </div>
                )}

              {!fastMovingLoading &&
                !fastMovingError &&
                supplySeries.length > 0 &&
                supplyChartData.length > 0 && (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={supplyChartData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10 }}
                            interval={0}
                          />
                          <YAxis
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) =>
                              value >= 1000
                                ? `₱${(value / 1000).toFixed(0)}k`
                                : `₱${value.toLocaleString()}`
                            }
                          />
                          <Tooltip content={<SupplyHistoryTooltip />} />
                          <Legend
                            wrapperStyle={{ paddingTop: "20px", fontSize: "11px" }}
                            iconType="rect"
                          />
                          {supplySeries.map((series, idx) => (
                            <Bar
                              key={series.productId}
                              dataKey={series.productId}
                              fill={SUPPLY_COLORS[idx % SUPPLY_COLORS.length]}
                              name={series.label}
                              maxBarSize={60}
                              className="cursor-pointer"
                              onClick={handleSupplyBarClick}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Supply History Movement Interpretation */}
                    {supplyInterpretation.length > 0 && (
                      <div className="mt-5 rounded-xl border border-dashed border-blue-200 bg-blue-50/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-3">
                          Automatic Interpretation
                        </p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {supplyInterpretation.map((line, idx) => (
                            <li key={idx} className="leading-relaxed">
                              • {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Product Sales Movement
                  </h3>
                  <p className="text-xs text-gray-500">
                    Weekly product sales for {selectedSalesMonthLabel} {salesYear}
                    {selectedSalesWeekMeta
                      ? ` • ${selectedSalesWeekMeta.label}`
                      : ""}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">
                      Category
                    </label>
                    <select
                      value={salesCategory}
                      onChange={(e) => setSalesCategory(e.target.value)}
                      disabled={categoriesLoading && categories.length === 0}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    >
                      <option value="all">All categories</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">
                      Year
                    </label>
                    <select
                      value={salesYear}
                      onChange={(e) => setSalesYear(parseInt(e.target.value, 10))}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    >
                      {yearOptions.map((yearOption) => (
                        <option key={yearOption} value={yearOption}>
                          {yearOption}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">
                      Month
                    </label>
                    <select
                      value={salesMonth}
                      onChange={(e) => setSalesMonth(parseInt(e.target.value, 10))}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    >
                      {MONTH_OPTIONS.map((monthOption) => (
                        <option key={monthOption.value} value={monthOption.value}>
                          {monthOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">
                      Week
                    </label>
                    <select
                      value={salesWeek}
                      onChange={(e) => setSalesWeek(e.target.value)}
                      disabled={salesWeekOptions.length === 0}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    >
                      <option value="all">All weeks</option>
                      {salesWeekOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}{" "}
                          {option.rangeText ? `(${option.rangeText})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {productSalesLoading && (
                <div className="h-64 flex items-center justify-center text-sm text-gray-500">
                  Loading sales movement...
                </div>
              )}

              {productSalesError && (
                <div className="text-sm text-red-500">{productSalesError}</div>
              )}

              {!productSalesLoading &&
                !productSalesError &&
                salesSeries.length === 0 && (
                  <div className="h-64 flex items-center justify-center text-sm text-gray-500">
                    No products found for this selection.
                  </div>
                )}

              {!productSalesLoading &&
                !productSalesError &&
                salesSeries.length > 0 &&
                salesChartData.length === 0 && (
                  <div className="h-64 flex items-center justify-center text-sm text-gray-500">
                    No sales movement recorded for this selection.
                  </div>
                )}

              {!productSalesLoading &&
                !productSalesError &&
                salesSeries.length > 0 &&
                salesChartData.length > 0 && (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={salesChartData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10 }}
                            interval={0}
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Legend
                            wrapperStyle={{ paddingTop: "20px", fontSize: "11px" }}
                            iconType="rect"
                          />
                          <Tooltip
                            content={({ active, label }) => {
                              if (!active) return null;
                              const meta = salesChartMeta[label];
                              return (
                                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg min-w-[220px] -translate-y-2">
                                  <p className="text-xs font-semibold text-gray-700">
                                    {meta?.title || label}
                                  </p>
                                  {meta?.subtitle && (
                                    <p className="text-xs text-gray-500 mb-2">
                                      {meta.subtitle}
                                    </p>
                                  )}
                                  <p className="text-[11px] text-gray-500 italic">
                                    Click any bar to view the full product list.
                                  </p>
                                </div>
                              );
                            }}
                          />
                          {salesSeries.map((series, idx) => (
                            <Bar
                              key={series.productId}
                              dataKey={series.productId}
                              fill={SUPPLY_COLORS[idx % SUPPLY_COLORS.length]}
                              name={series.label}
                              maxBarSize={60}
                              className="cursor-pointer"
                              onClick={handleSalesBarClick}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Product Sales Movement Interpretation */}
                    {salesMovementInterpretation.length > 0 && (
                      <div className="mt-5 rounded-xl border border-dashed border-orange-200 bg-orange-50/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 mb-3">
                          Automatic Interpretation
                        </p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {salesMovementInterpretation.map((line, idx) => (
                            <li key={idx} className="leading-relaxed">
                              • {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>

          {/* RIGHT (1/3) */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              {/* <h2 className="text-lg font-semibold mb-4">Quick Insights</h2>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  📈 Highest Sales Day: <strong>₱12,500</strong>
                </li>
                <li>
                  🛒 Best Product: <strong>Product A</strong>
                </li>
                <li>
                  👥 Top Customer: <strong>John Doe</strong>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Stock Overview
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Monitor your inventory levels at a glance
                </p>
              </div> */}
              <StockCards />
            </div>

            <SupplyHistoryCard />
          </div>
        </div>
      </div>
    </div>

    {selectedSupplyBar && (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={closeSupplyBarDetails}
        ></div>
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="flex items-start justify-between p-4 border-b border-gray-100">
            <div>
              <p className="text-base font-semibold text-gray-900">
                {selectedSupplyBar.label}
              </p>
              {selectedSupplyBar.subtitle && (
                <p className="text-xs text-gray-500">
                  {selectedSupplyBar.subtitle}
                </p>
              )}
            </div>
            <button
              onClick={closeSupplyBarDetails}
              className="text-xl leading-none text-gray-400 hover:text-gray-700 transition"
              aria-label="Close product breakdown"
            >
              ×
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3 max-h-[60vh] overflow-y-auto pr-1">
              {supplyModalProducts.map((product) => {
                const color = getSupplyProductColor(product.productId);
                return (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between gap-2 rounded border border-gray-100 bg-gray-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-gray-600 font-medium text-[11px] truncate">
                        {product.label}
                      </span>
                    </div>
                    <span className="font-semibold text-blue-600 text-[11px] flex-shrink-0">
                      {product.value.toLocaleString()} units
                    </span>
    </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )}
    {selectedSalesBar && (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={closeSalesBarDetails}
        ></div>
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="flex items-start justify-between p-4 border-b border-gray-100">
            <div>
              <p className="text-base font-semibold text-gray-900">
                {selectedSalesBar.label}
              </p>
              {selectedSalesBar.subtitle && (
                <p className="text-xs text-gray-500">
                  {selectedSalesBar.subtitle}
                </p>
              )}
            </div>
            <button
              onClick={closeSalesBarDetails}
              className="text-xl leading-none text-gray-400 hover:text-gray-700 transition"
              aria-label="Close product breakdown"
            >
              ×
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3 max-h-[60vh] overflow-y-auto pr-1">
              {salesModalProducts.map((product) => {
                const color = getSalesProductColor(product.productId);
                return (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between gap-2 rounded border border-gray-100 bg-gray-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-gray-600 font-medium text-[11px] truncate">
                        {product.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-semibold text-green-600 text-[11px]">
                        ₱{product.salesAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                      </span>
                      <span className="font-semibold text-blue-600 text-[11px]">
                        {product.units?.toLocaleString() || 0} units
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default Dashboard;
