import React, { useState } from "react";
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
  const [option, setOption] = useState("weekly");
  const { user } = useAuthContext();
  const {
    data: salesData,
    loading,
    error,
  } = useFetch(
    "dashboard/supply-sales",
    {
      params: { option },
      headers: { Authorization: `Bearer ${user.token}` },
    },
    [option]
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

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Supply vs Sales Analysis
          </h2>
          <p className="text-sm text-gray-500">
            {option === "weekly" ? "Weekly" : "Monthly"} performance overview
          </p>
        </div>
        <select
          value={option}
          onChange={(e) => setOption(e.target.value)}
          className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer shadow-sm"
        >
          <option value="weekly">📅 Weekly View</option>
          <option value="monthly">📊 Monthly View</option>
        </select>
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
        <div className="bg-white rounded-xl p-6 shadow-inner">
          <ResponsiveContainer width="100%" height={400}>
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
