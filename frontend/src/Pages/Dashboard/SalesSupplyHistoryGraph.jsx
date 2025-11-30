import React, { useMemo, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useFetch } from "../../hooks/useFetch";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatPrice } from "../../utils/formatPrice";

function SalesSupplyHistoryGraph() {
  const [option, setOption] = useState("month");
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const { user } = useAuthContext();
  
  const params = { option, year };
  if (option === "month") {
    params.month = month;
  }
  
  const {
    data: salesData,
    loading,
    error,
  } = useFetch(
    "dashboard/supply-sales",
    {
      params,
      headers: { Authorization: `Bearer ${user.token}` },
    },
    [option, year, month]
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span>{" "}
              {formatPrice(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate summary statistics
  const getSummary = () => {
    if (!salesData?.data || salesData.data.length === 0) return null;

    const data = salesData.data;
    const totalSupply = data.reduce((sum, item) => sum + (item.totalSupplyCost || 0), 0);
    const totalSalesAmount = data.reduce((sum, item) => sum + (item.totalSales || 0), 0);
    const totalProfit = data.reduce((sum, item) => sum + (item.difference || 0), 0);
    const profitMargin = totalSalesAmount > 0 ? (totalProfit / totalSalesAmount) * 100 : 0;
    const avgProfit = data.length > 0 ? totalProfit / data.length : 0;

    // Find best performing period
    const bestPeriod = [...data].sort((a, b) => (b.difference || 0) - (a.difference || 0))[0];

    return {
      totalSupply,
      totalSalesAmount,
      totalProfit,
      profitMargin,
      avgProfit,
      bestPeriod,
    };
  };

  const summary = getSummary();

  const interpretation = useMemo(() => {
    if (!summary || !salesData?.data?.length) return [];

    const optionLabel = option === "month" ? "week" : option === "year" ? "month" : "year";
    const lines = [];

      lines.push(
      `Total supply spending was ${formatPrice(
          summary.totalSupply
      )} versus ${formatPrice(summary.totalSalesAmount)} in sales for this ${optionLabel} range.`
      );

    lines.push(
      `Net profit reached ${formatPrice(summary.totalProfit)}, reflecting a ${summary.profitMargin.toFixed(
        1
      )}% margin and ${formatPrice(summary.avgProfit)} average profit per ${optionLabel}.`
    );

    if (summary.bestPeriod) {
      lines.push(
        `Top-performing ${optionLabel}: ${summary.bestPeriod.period} with ${formatPrice(
          summary.bestPeriod.difference
        )} profit.`
      );
    }

    return lines;
  }, [summary, salesData, option]);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
            Supply vs Sales Analysis
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {option === "month" ? "Monthly (by week)" : option === "year" ? "Yearly (by month)" : "Overall (by year)"} performance overview
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
        <select
          value={option}
          onChange={(e) => setOption(e.target.value)}
          className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer shadow-sm"
        >
            <option value="month">📅 By Month</option>
            <option value="year">📊 By Year</option>
            <option value="overall">🌐 Overall</option>
          </select>
          
          {option !== "overall" && (
            <>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer shadow-sm"
              >
                {Array.from({ length: 6 }, (_, idx) => {
                  const yr = new Date().getFullYear() - idx;
                  return (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  );
                })}
              </select>
              
              {option === "month" && (
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer shadow-sm"
                >
                  {[
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
                  ].map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
        </select>
              )}
            </>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Loading chart data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-96">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-500 text-4xl mb-3">⚠️</div>
            <p className="text-red-700 font-semibold">Failed to load data</p>
            <p className="text-red-600 text-sm mt-1">Please try again later</p>
          </div>
        </div>
      )}

      {!loading && !error && salesData?.data?.length > 0 ? (
        <>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-inner">
            <ResponsiveContainer width="100%" height={350} className="sm:h-[400px]">
            <LineChart
              data={salesData.data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 13, fill: "#6b7280", fontWeight: 500 }}
                tickMargin={10}
                stroke="#d1d5db"
              />
              <YAxis
                tick={{ fontSize: 13, fill: "#6b7280", fontWeight: 500 }}
                tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                stroke="#d1d5db"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="line"
                formatter={(value) => (
                  <span className="text-sm font-medium">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="totalSupplyCost"
                stroke="#3b82f6"
                name="Supply Cost"
                strokeWidth={3}
                dot={{ r: 5, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7, fill: "#3b82f6" }}
              />
              <Line
                type="monotone"
                dataKey="totalSales"
                stroke="#10b981"
                name="Sales"
                strokeWidth={3}
                dot={{ r: 5, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7, fill: "#10b981" }}
              />
              <Line
                type="monotone"
                dataKey="difference"
                stroke="#f59e0b"
                name="Profit"
                strokeWidth={3}
                dot={{ r: 5, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7, fill: "#f59e0b" }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

          {/* Summary Statistics */}
          {summary && (
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Analysis Summary
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Total Supply Cost */}
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-3 sm:p-4 border-2 border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <p className="text-xs text-gray-600 font-medium">
                      Total Supply Cost
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-blue-600 mb-0.5">
                    {formatPrice(summary.totalSupply)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {option === "month" ? "Monthly" : option === "year" ? "Yearly" : "Overall"} investment
                  </p>
                </div>

                {/* Total Sales */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border-2 border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="text-xs text-gray-600 font-medium">
                      Total Sales
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-green-600 mb-0.5">
                    {formatPrice(summary.totalSalesAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Revenue generated
                  </p>
                </div>

                {/* Total Profit */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 sm:p-4 border-2 border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <p className="text-xs text-gray-600 font-medium">
                      Total Profit
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-amber-600 mb-0.5">
                    {formatPrice(summary.totalProfit)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Net earnings
                  </p>
                </div>

                {/* Profit Margin */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 sm:p-4 border-2 border-purple-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <p className="text-xs text-gray-600 font-medium">
                      Profit Margin
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-purple-600 mb-0.5">
                    {summary.profitMargin.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Return on sales
                  </p>
                </div>

                {/* Average Profit */}
                <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-3 sm:p-4 border-2 border-cyan-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                    <p className="text-xs text-gray-600 font-medium">
                      Avg Profit
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-cyan-600 mb-0.5">
                    {formatPrice(summary.avgProfit)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Per period
                  </p>
                </div>

                {/* Best Period */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 sm:p-4 border-2 border-rose-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <p className="text-xs text-gray-600 font-medium">
                      Best Period
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-rose-600 mb-0.5">
                    {formatPrice(summary.bestPeriod.difference)}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {summary.bestPeriod.period}
                  </p>
                </div>
              </div>

              {interpretation.length > 0 && (
                <div className="mt-5 rounded-xl border border-dashed border-amber-200 bg-amber-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-3">
                    Automatic Interpretation
                  </p>
                  <ul className="space-y-2 text-sm text-gray-800">
                    {interpretation.map((line, idx) => (
                      <li key={idx} className="leading-relaxed">
                        • {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        !loading &&
        !error && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-gray-300 text-6xl mb-4">📊</div>
              <p className="text-gray-500 font-medium text-lg">
                No data available
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Data will appear here once available
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default SalesSupplyHistoryGraph;
