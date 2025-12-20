import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Pagination from "../../components/Pagination";
import SearchBar from "../../components/SearchBar";
import { useSupplyHistoryStore } from "../../store/supplyHistoryStore";
import { useLiveResourceRefresh } from "../../hooks/useLiveResourceRefresh";
import {
  Clock,
  TrendingUp,
  Calendar,
  X,
  AlertCircle,
  Boxes,
  ChevronRight,
  Package,
  Loader2,
  FileWarning,
  DollarSign,
} from "lucide-react";
import { useIsMobile } from "../../hooks/useIsMobile";

const SupplyHistories = () => {
  const { user } = useAuthContext();
  const {
    supplyHistories,
    pages,
    loading,
    fetchSupplyHistories,
    fetchMoneySpentSevenDays,
    fetchTotalMoneySpent,
    fetchLostMoneyStats,
    fetchTotalStock,
  } = useSupplyHistoryStore();

  const [last7DaysSpending, setLast7DaysSpending] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [totalMoneySpent, setTotalMoneySpent] = useState(0);
  const [lostMoney, setLostMoney] = useState({ total: 0, last7: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const limit = 10;

  const isMobile = useIsMobile(768);
  const supplyLiveKey = useLiveResourceRefresh(["supply", "inventory"]);

  const toggleExpandedRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user?.token) return;
      try {
        const [spending, stock, total, lost] = await Promise.all([
          fetchMoneySpentSevenDays(user.token),
          fetchTotalStock(user.token),
          fetchTotalMoneySpent(user.token),
          fetchLostMoneyStats(user.token),
        ]);

        setLast7DaysSpending(
          spending.reduce((sum, day) => sum + day.totalSpent, 0)
        );
        setTotalStock(stock || 0);
        setTotalMoneySpent(total);
        setLostMoney({
          total: lost?.totalLostMoney || 0,
          last7: lost?.last7DaysLostMoney || 0,
        });
      } catch (err) {
        console.error("Failed to load analytics:", err);
      }
    };

    loadAnalytics();
  }, [user?.token, fetchMoneySpentSevenDays, fetchTotalStock, fetchTotalMoneySpent, fetchLostMoneyStats, supplyLiveKey]);

  // Debounce search input
  useEffect(() => {
    setIsSearching(true);
    const timeout = setTimeout(() => {
      setQuery(search);
      setPage(1);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  // Fetch data whenever filters change
  useEffect(() => {
    if (user?.token) {
      fetchSupplyHistories({
        token: user.token,
        page,
        limit,
        search: query,
        startDate,
        endDate,
      });
    }
  }, [page, query, startDate, endDate, user?.token, supplyLiveKey, fetchSupplyHistories]);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setPage(1);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setPage(1);
  };

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasDateFilter = startDate || endDate;

  const getDateRangeText = () => {
    if (startDate && endDate) {
      return `${new Date(startDate + "T00:00:00").toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })} - ${new Date(endDate + "T00:00:00").toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}`;
    } else if (startDate) {
      return `From ${new Date(startDate + "T00:00:00").toLocaleDateString(
        "en-PH",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      )}`;
    } else if (endDate) {
      return `Up to ${new Date(endDate + "T00:00:00").toLocaleDateString(
        "en-PH",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      )}`;
    }
    return "";
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full px-2 sm:px-3 lg:px-3 xl:px-4 py-2 sm:py-3 ml-4 sm:ml-6 lg:ml-8 transform scale-98 origin-top-left">
      {/* Header + Search */}
      <div className="mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          {/* Title */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg shadow-md flex-shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
                Supply History
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block">
                View all supply restock transactions
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-auto sm:ml-auto max-w-xl">
            <SearchBar
              search={search}
              onSearchChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              isSearching={isSearching}
              placeholder="Search product name..."
            />
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1 w-full">
              <Calendar className="h-4 w-4 text-base-content/70 flex-shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="input input-bordered input-sm w-full flex-1"
                placeholder="Start date"
              />
            </div>
            <span className="hidden sm:block text-xs text-base-content/70 self-center">to</span>
            <div className="flex items-center gap-1.5 flex-1 w-full">
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="input input-bordered input-sm w-full flex-1"
                placeholder="End date"
                min={startDate || undefined}
              />
              {hasDateFilter && (
                <button
                  onClick={clearDateFilters}
                  className="btn btn-ghost btn-xs btn-circle flex-shrink-0"
                  title="Clear date filters"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          {hasDateFilter && (
            <div className="text-xs text-base-content/70">
              Showing results for:{" "}
              <span className="font-semibold">{getDateRangeText()}</span>
            </div>
          )}
        </div>
      </div>

      {/* ===== ANALYTICS CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {/* Money Spent (Last 7 Days) */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-gray-500 text-xs font-medium mb-1">Money Spent (Last 7 Days)</p>
            <p className="text-sm sm:text-base font-bold text-gray-900 break-words leading-tight">
              ₱{Number(last7DaysSpending || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="p-1.5 bg-blue-100 rounded-full flex-shrink-0">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        {/* Total Stock On Hand */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-gray-500 text-xs font-medium mb-1">Total Stock On Hand</p>
            <p className="text-sm sm:text-base font-bold text-gray-900 break-words leading-tight">
              {Number(totalStock || 0).toLocaleString()}
              <span className="text-xs ml-1 font-medium text-gray-600">pcs</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">All active variants</p>
          </div>
          <div className="p-1.5 bg-purple-100 rounded-full flex-shrink-0">
            <Boxes className="w-4 h-4 text-purple-600" />
          </div>
        </div>

        {/* Total Money Spent (All Time) */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-gray-500 text-xs font-medium mb-1">Total Money Spent (All Time)</p>
            <p className="text-sm sm:text-base font-bold text-gray-900 break-words leading-tight">
              ₱{Number(totalMoneySpent || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="p-1.5 bg-green-100 rounded-full flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
        </div>

        {/* Lost Money (All Time) */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-gray-500 text-xs font-medium mb-1">Lost Money (All Time)</p>
            <p className="text-sm sm:text-base font-bold text-gray-900 break-words leading-tight">
              ₱{Number(lostMoney.total || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Last 7 days: ₱{Number(lostMoney.last7 || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="p-1.5 bg-red-100 rounded-full flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
        </div>
      </div>

      {/* ===== SUPPLY HISTORY LIST ===== */}
      {loading ? (
        <div className="flex flex-col justify-center items-center min-h-[300px] bg-base-100 rounded-lg">
          <Loader2 className="animate-spin w-8 h-8 text-primary mb-3" />
          <p className="text-sm text-base-content/60">Loading supply histories...</p>
        </div>
      ) : !supplyHistories?.length ? (
        <div className="bg-base-100 rounded-lg shadow-sm border border-base-300">
          <div className="text-center py-8">
            <div className="bg-base-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileWarning className="h-8 w-8 text-base-content/30" />
            </div>
            <h3 className="text-base font-semibold text-base-content mb-1.5">
              No Supply Histories Found
            </h3>
            <p className="text-sm text-base-content/60">
              {hasDateFilter
                ? "No supply histories found for the selected date range"
                : "No supply histories have been created yet"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {supplyHistories.map((h) => {
            const isExpanded = expandedRow === h._id;
            const productName = h.product_variant?.product?.name || h.productName || "Unknown Product";
            const variantSize = h.product_variant?.size || h.variantSize || "";
            const variantUnit = h.product_variant?.unit || h.variantUnit || "";
            const variantColor = h.product_variant?.color || "";
            
            return (
              <div
                key={h._id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Main Card Content */}
                <div className="p-3 sm:p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    {/* Left Section - Product Info */}
                    <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                              {productName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {variantSize && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-medium">
                                  {variantSize}
                                </span>
                              )}
                              {variantUnit && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                                  {variantUnit}
                                </span>
                              )}
                              {variantColor && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 text-xs font-medium capitalize">
                                  {variantColor}
                                </span>
                              )}
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
                                {h.quantity} pcs
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Date and Price - Mobile */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs mt-1.5">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>
                              {new Date(h.supplied_at || h.createdAt).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-green-600">
                              ₱{h.total_cost?.toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                              }) || "0.00"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions (Desktop) */}
                    <div className="hidden lg:flex items-center gap-3">
                      {/* Expand Button */}
                      <button
                        onClick={() => toggleExpandedRow(h._id)}
                        className="btn btn-ghost btn-xs btn-circle"
                        aria-label="Toggle details"
                      >
                        <ChevronRight
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Mobile Actions */}
                    <div className="lg:hidden flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => toggleExpandedRow(h._id)}
                        className="btn btn-ghost btn-xs btn-circle ml-auto"
                        aria-label="Toggle details"
                      >
                        <ChevronRight
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      {/* Left Column - Pricing Details */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <DollarSign className="w-3.5 h-3.5 text-green-600" />
                          <h4 className="font-semibold text-xs text-gray-700">
                            Pricing Details
                          </h4>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-2.5 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Supplier Price:</span>
                            <span className="text-xs font-bold text-gray-900">
                              ₱{h.supplier_price?.toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                              }) || "0.00"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Quantity:</span>
                            <span className="font-semibold text-xs text-gray-900">
                              {h.quantity} pcs
                            </span>
                          </div>
                          <div className="pt-1.5 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-700">Total Cost:</span>
                            <span className="text-sm font-bold text-green-600">
                              ₱{h.total_cost?.toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                              }) || "0.00"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Date Information */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Calendar className="w-3.5 h-3.5 text-purple-600" />
                          <h4 className="font-semibold text-xs text-gray-700">
                            Date Information
                          </h4>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-2.5 space-y-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Date Supplied</p>
                            <p className="text-xs font-semibold text-gray-900">
                              {new Date(h.supplied_at || h.createdAt).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Created At</p>
                            <p className="text-xs font-semibold text-gray-900">
                              {new Date(h.createdAt).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(h.createdAt).toLocaleTimeString("en-PH", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-4">
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      )}
      </div>
    </div>
  );
};

export default SupplyHistories;
