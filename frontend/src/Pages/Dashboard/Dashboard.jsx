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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sales Dashboard
            </h1>
          </div>
          <p className="text-gray-600">
            Track your sales performance over time
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <SalesCards
              salesData={salesData}
              loading={loading}
              totalSales={totalSales}
              averageSales={averageSales}
            />

            {/* Main Chart Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* Chart Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    Sales Trends
                  </h2>
                  <p className="text-gray-500 text-sm">
                    View your sales performance over different time periods
                  </p>
                </div>

                {/* Option Selector */}
                <div className="mt-4 sm:mt-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:hidden">
                    Time Period
                  </label>
                  <div className="relative">
                    <select
                      value={option}
                      onChange={handleOptionChange}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  <div className="flex items-center justify-center h-96">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-gray-500">Loading sales data...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center justify-center h-96">
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
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={salesData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="period"
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${formatPrice(value)}`}
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

                {!loading && salesData?.length === 0 && (
                  <div className="flex items-center justify-center h-96">
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
            </div>
          </div>

          {/* RIGHT (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>✅ Order #1023 completed</li>
                <li>✅ Order #1022 completed</li>
                <li>❌ Order #1021 failed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
