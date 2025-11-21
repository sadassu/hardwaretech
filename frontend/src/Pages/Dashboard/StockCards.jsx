import React, { useState } from "react";
import { AlertTriangle, XCircle, Package, TrendingUp } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import Modal from "../../components/Modal";
import { StockList } from "./StockList";

function StockCards() {
  const [selectedType, setSelectedType] = useState(null);

  // Fetch only the counts (limit=0, optimized)
  const { data, loading, error } = useFetch(
    `dashboard/stocks?type=all&page=1&limit=0`,
    {},
    []
  );
  const { data: lowData } = useFetch(
    `dashboard/stocks?type=low&page=1&limit=0`,
    {},
    []
  );
  const { data: outData } = useFetch(
    `dashboard/stocks?type=out&page=1&limit=0`,
    {},
    []
  );

  const stats = [
    {
      label: "All Stocks",
      count: data?.total || 0,
      type: "all",
      icon: Package,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      hoverGradient: "hover:from-blue-600 hover:to-blue-700",
    },
    {
      label: "Low Stock",
      count: lowData?.total || 0,
      type: "low",
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      iconBg: "bg-amber-100",
      textColor: "text-amber-600",
      hoverGradient: "hover:from-amber-600 hover:to-orange-600",
    },
    {
      label: "Out of Stock",
      count: outData?.total || 0,
      type: "out",
      icon: XCircle,
      gradient: "from-red-500 to-rose-600",
      bgColor: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      hoverGradient: "hover:from-red-600 hover:to-rose-700",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden">
              <div className="h-2 bg-gray-200"></div>
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-700">Error loading stock data</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-600" />
          Inventory Overview
        </h3>
        <span className="text-xs text-gray-500 hidden sm:inline">Click to view details</span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.type}
              onClick={() => setSelectedType(stat.type)}
              className={`group cursor-pointer bg-white rounded-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 active:scale-95 border-2 border-transparent hover:border-gray-100`}
            >
              {/* Gradient header */}
              <div
                className={`h-2 bg-gradient-to-r ${stat.gradient} ${stat.hoverGradient} transition-all duration-300`}
              ></div>

              <div className="p-4 sm:p-5 lg:p-6 relative">
                {/* Click indicator */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div
                    className={`${stat.iconBg} p-2 sm:p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                  >
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ${stat.textColor}`} />
                  </div>
                  <div className={`px-2 py-1 rounded-full ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <span className={`text-xs font-semibold ${stat.textColor}`}>View</span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1 flex items-center gap-1">
                    {stat.label}
                    {stat.count > 0 && stat.type !== 'all' && (
                      <span className={`w-2 h-2 rounded-full ${
                        stat.type === 'out' ? 'bg-red-500 animate-pulse' : 
                        stat.type === 'low' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'
                      }`}></span>
                    )}
                  </p>
                  <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${stat.textColor} group-hover:scale-105 transition-transform`}>
                    {stat.count.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stat.type === 'all' ? 'Total variants' : 
                     stat.type === 'low' ? 'Need restock' : 
                     'Unavailable'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal with stock details */}
      <Modal 
        isOpen={!!selectedType} 
        onClose={() => setSelectedType(null)}
        className="bg-transparent max-w-4xl"
      >
        {selectedType && (
          <StockList
            type={selectedType}
            onClose={() => setSelectedType(null)}
          />
        )}
      </Modal>
    </div>
  );
}

export default StockCards;
