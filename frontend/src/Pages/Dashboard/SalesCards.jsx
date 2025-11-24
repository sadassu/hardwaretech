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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {/* Total Sales */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-gray-500 text-xs font-medium mb-1.5">Total Sales</p>
          <p className="text-base sm:text-lg font-bold text-gray-900 break-words leading-tight">
            {formatPrice(totalSales)}
          </p>
        </div>
        <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
        </div>
      </div>

      {/* Average Sales */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-gray-500 text-xs font-medium mb-1.5">Average Sales</p>
          <p className="text-base sm:text-lg font-bold text-gray-900 break-words leading-tight">
            {formatPrice(averageSales)}
          </p>
        </div>
        <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        </div>
      </div>

      {/* Data Points */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 sm:col-span-2 lg:col-span-1">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-gray-500 text-xs font-medium mb-1.5">Data Points</p>
          <p className="text-base sm:text-lg font-bold text-gray-900">{salesData.length}</p>
        </div>
        <div className="p-2 bg-purple-100 rounded-full flex-shrink-0">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
        </div>
      </div>
    </div>
  );
}

export default SalesCards;
