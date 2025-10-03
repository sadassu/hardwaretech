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
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-medium">Error loading stock data</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div >
      

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.type}
              onClick={() => setSelectedType(stat.type)}
              className={`group cursor-pointer rounded-2xl hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1`}
            >
              {/* Gradient header */}
              <div
                className={`h-2 bg-gradient-to-r ${stat.gradient} ${stat.hoverGradient} transition-all duration-300`}
              ></div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`${stat.iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-7 h-7 ${stat.textColor}`} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-4xl font-bold ${stat.textColor}`}>
                    {stat.count.toLocaleString()}
                  </p>
                </div>

                {/* Click hint */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
                    Click to view details →
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal with stock details */}
      <Modal isOpen={!!selectedType} onClose={() => setSelectedType(null)}>
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
