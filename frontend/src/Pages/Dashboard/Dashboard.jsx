import React, { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { useAuthContext } from "../../hooks/useAuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, AlertCircle } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";
import SalesCards from "./SalesCards";
import StockCards from "./StockCards";
import { formatDatePHT } from "../../utils/formatDate";
import SupplyHistoryCard from "./SupplyHistoryCard";
import SalesSupplyHistoryGraph from "./SalesSupplyHistoryGraph";

function Dashboard() {
  const [option, setOption] = useState("daily");
  const { user } = useAuthContext();

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
    [option]
  );

  const handleOptionChange = (e) => setOption(e.target.value);

  const totalSales =
    salesData?.reduce((sum, item) => sum + (item.totalSales || 0), 0) || 0;
  const averageSales =
    salesData?.length > 0 ? (totalSales / salesData.length).toFixed(2) : 0;

  // Calculate summary statistics
  const getStatsSummary = () => {
    if (!salesData || salesData.length === 0) return null;

    const sortedData = [...salesData].sort(
      (a, b) => b.totalSales - a.totalSales
    );
    const highestSale = sortedData[0];
    const lowestSale = sortedData[sortedData.length - 1];

    // Calculate trend (compare first half vs second half)
    const midPoint = Math.floor(salesData.length / 2);
    const firstHalfAvg =
      salesData.slice(0, midPoint).reduce((sum, item) => sum + item.totalSales, 0) /
      midPoint;
    const secondHalfAvg =
      salesData.slice(midPoint).reduce((sum, item) => sum + item.totalSales, 0) /
      (salesData.length - midPoint);
    const trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    return {
      highest: highestSale,
      lowest: lowestSale,
      trend: trendPercentage,
      isPositive: trendPercentage >= 0,
    };
  };

  const statsSummary = getStatsSummary();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg flex-shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Sales Dashboard
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 ml-9 sm:ml-11">
            Track your sales performance over time
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* LEFT (2/3) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Stats Cards */}
            <SalesCards
              salesData={salesData}
              loading={loading}
              totalSales={totalSales}
              averageSales={averageSales}
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
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

                    {/* Average Sale */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 sm:p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-xs text-gray-600 font-medium">
                          Average Sale
                        </p>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-blue-600 mb-0.5">
                        {formatPrice(averageSales)}
                      </p>
                      <p className="text-xs text-gray-500">Per period</p>
                    </div>

                    {/* Trend */}
                    <div
                      className={`bg-gradient-to-br ${
                        statsSummary.isPositive
                          ? "from-purple-50 to-violet-50 border-purple-100"
                          : "from-red-50 to-rose-50 border-red-100"
                      } rounded-xl p-3 sm:p-4 border`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            statsSummary.isPositive
                              ? "bg-purple-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <p className="text-xs text-gray-600 font-medium">
                          Trend
                        </p>
                      </div>
                      <p
                        className={`text-lg sm:text-xl font-bold mb-0.5 ${
                          statsSummary.isPositive
                            ? "text-purple-600"
                            : "text-red-600"
                        }`}
                      >
                        {statsSummary.isPositive ? "+" : ""}
                        {statsSummary.trend.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {statsSummary.isPositive ? "Growth" : "Decline"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <SalesSupplyHistoryGraph />
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
  );
}

export default Dashboard;
