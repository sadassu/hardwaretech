import React from "react";
import { TrendingUp, BarChart3, Calendar } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";

function SalesCards({
  salesData = [],
  loading = false,
  totalSales = 0,
  averageSales = 0,
}) {
  if (!salesData || salesData.length === 0 || loading) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
      {/* Total Sales */}
      <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow">
        <div>
          <p className="text-gray-500 text-sm font-medium">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(totalSales)}
          </p>
        </div>
        <div className="p-3 bg-green-100 rounded-full">
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
      </div>

      {/* Average Sales */}
      <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow">
        <div>
          <p className="text-gray-500 text-sm font-medium">Average Sales</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(averageSales)}
          </p>
        </div>
        <div className="p-3 bg-blue-100 rounded-full">
          <BarChart3 className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {/* Data Points */}
      <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow">
        <div>
          <p className="text-gray-500 text-sm font-medium">Data Points</p>
          <p className="text-2xl font-bold text-gray-900">{salesData.length}</p>
        </div>
        <div className="p-3 bg-purple-100 rounded-full">
          <Calendar className="w-6 h-6 text-purple-600" />
        </div>
      </div>
    </div>
  );
}

export default SalesCards;
