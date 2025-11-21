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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      {/* Total Sales */}
      <div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 bg-white rounded-xl sm:rounded-2xl shadow">
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Total Sales</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
            {formatPrice(totalSales)}
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0 ml-2">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
        </div>
      </div>

      {/* Average Sales */}
      <div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 bg-white rounded-xl sm:rounded-2xl shadow">
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Average Sales</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
            {formatPrice(averageSales)}
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0 ml-2">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        </div>
      </div>

      {/* Data Points */}
      <div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 bg-white rounded-xl sm:rounded-2xl shadow sm:col-span-2 lg:col-span-1">
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Data Points</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{salesData.length}</p>
        </div>
        <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0 ml-2">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
        </div>
      </div>
    </div>
  );
}

export default SalesCards;
