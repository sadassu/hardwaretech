import React, { useState } from "react";
import { AlertTriangle, XCircle, Package, TrendingUp, Info } from "lucide-react";
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
        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="h-1 bg-gray-200"></div>
              <div className="p-3.5">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-500" />
          Inventory Overview
        </h3>
        <button
          onClick={() => {
            // Show info about inventory overview - you can customize this
            alert("Click on any card to view detailed stock information");
          }}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors group"
          title="Click to view details"
        >
          <Info className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.type}
              onClick={() => setSelectedType(stat.type)}
              className="cursor-pointer bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200 overflow-hidden flex flex-col"
            >
              {/* Simple header bar */}
              <div className={`h-1 bg-gradient-to-r ${stat.gradient}`}></div>

              <div className="p-4 flex flex-col flex-1 min-h-[140px]">
                {/* Label at top */}
                <div className="mb-3">
                  <p className="text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5">
                    {stat.label}
                    {stat.count > 0 && stat.type !== 'all' && (
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        stat.type === 'out' ? 'bg-red-500' : 
                        stat.type === 'low' ? 'bg-amber-500' : 'bg-green-500'
                      }`}></span>
                    )}
                  </p>
                </div>

                {/* Large number centered */}
                <div className="text-center mb-2">
                  <p className={`text-3xl font-bold ${stat.textColor}`}>
                    {stat.count.toLocaleString()}
                  </p>
                </div>

                {/* Description text */}
                <div className="text-center mb-3">
                  <p className="text-xs text-gray-500">
                    {stat.type === 'all' ? 'Total variants' : 
                     stat.type === 'low' ? 'Need restock' : 
                     'Unavailable'}
                  </p>
                </div>

                {/* Icon at bottom - fixed position */}
                <div className="flex justify-start mt-auto">
                  <div className={`${stat.iconBg} p-2 rounded-lg`}>
                    <Icon className={`w-4 h-4 ${stat.textColor}`} />
                  </div>
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
