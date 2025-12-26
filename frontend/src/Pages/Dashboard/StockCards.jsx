import React, { useState } from "react";
import { XCircle, Package, Info } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import Modal from "../../components/Modal";
import { StockList } from "./StockList";
import { useLiveResourceRefresh } from "../../hooks/useLiveResourceRefresh";

function StockCards({ isPos = false }) {
  const [selectedType, setSelectedType] = useState(null);
  const inventoryLiveKey = useLiveResourceRefresh(["inventory", "supply"]);

  // Fetch only the counts (limit=0, optimized)
  const { data, loading, error } = useFetch(
    `dashboard/stocks?type=all&page=1&limit=0`,
    {},
    [inventoryLiveKey]
  );
  const { data: lowData } = useFetch(
    `dashboard/stocks?type=low&page=1&limit=0`,
    {},
    [inventoryLiveKey]
  );
  const { data: outData } = useFetch(
    `dashboard/stocks?type=out&page=1&limit=0`,
    {},
    [inventoryLiveKey]
  );

  const stats = [
    {
      label: "All Stocks",
      count: data?.total || 0,
      type: "all",
      gradient: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
    },
    {
      label: "Low Stock",
      count: lowData?.total || 0,
      type: "low",
      gradient: "from-amber-500 to-orange-500",
      textColor: "text-amber-600",
    },
    {
      label: "Out of Stock",
      count: outData?.total || 0,
      type: "out",
      gradient: "from-red-500 to-rose-600",
      textColor: "text-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className={isPos ? "grid grid-cols-1 sm:grid-cols-3 gap-4" : "grid grid-cols-1 sm:grid-cols-3 gap-2.5"}>
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
      <div className="flex items-center gap-2">
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
      <div className={isPos ? "grid grid-cols-1 sm:grid-cols-3 gap-4" : "space-y-3"}>
        {stats.map((stat) => {
          return (
            <div
              key={stat.type}
              onClick={() => setSelectedType(stat.type)}
              className="cursor-pointer bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {stat.label}
                  </p>
                  <p className="text-sm text-gray-400">
                    {stat.type === "all"
                      ? "Total variants tracked"
                      : stat.type === "low"
                      ? "Needs restock attention"
                      : "Currently unavailable"}
                  </p>
                </div>

                <div className="text-right">
                  <p className={`text-3xl sm:text-4xl font-bold ${stat.textColor}`}>
                    {stat.count.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stat.type === "all"
                      ? "Active Products"
                      : stat.type === "low"
                      ? "Low quantity items"
                      : "Out of stock items"}
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
