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
    <div className="container mx-auto p-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content">
              Supply Histories
            </h1>
            <p className="text-base-content/70 mt-1">
              View all supply restock transactions
            </p>
          </div>

          <SearchBar
            search={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            isSearching={isSearching}
            placeholder="Search product name..."
          />
        </div>

        {/* ===== DATE RANGE FILTER ===== */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1 w-full">
              <Calendar className="h-5 w-5 text-base-content/70 flex-shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="input input-bordered w-full flex-1"
                placeholder="Start date"
              />
            </div>
            <span className="hidden sm:block text-base-content/70 self-center">to</span>
            <div className="flex items-center gap-2 flex-1 w-full">
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="input input-bordered w-full flex-1"
                placeholder="End date"
                min={startDate || undefined}
              />
              {hasDateFilter && (
                <button
                  onClick={clearDateFilters}
                  className="btn btn-ghost btn-sm btn-circle flex-shrink-0"
                  title="Clear date filters"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          {hasDateFilter && (
            <div className="text-sm text-base-content/70">
              Showing results for:{" "}
              <span className="font-semibold">{getDateRangeText()}</span>
            </div>
          )}
        </div>
      </div>

      {/* ===== ANALYTICS CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {/* Money Spent (Last 7 Days) */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-gray-500 text-xs font-medium mb-1.5">Money Spent (Last 7 Days)</p>
            <p className="text-base sm:text-lg font-bold text-gray-900 break-words leading-tight">
              ₱{Number(last7DaysSpending || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
        </div>

        {/* Total Stock On Hand */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-gray-500 text-xs font-medium mb-1.5">Total Stock On Hand</p>
            <p className="text-base sm:text-lg font-bold text-gray-900 break-words leading-tight">
              {Number(totalStock || 0).toLocaleString()}
              <span className="text-xs ml-1 font-medium text-gray-600">pcs</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">All active variants</p>
          </div>
          <div className="p-2 bg-purple-100 rounded-full flex-shrink-0">
            <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          </div>
        </div>

        {/* Total Money Spent (All Time) */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-gray-500 text-xs font-medium mb-1.5">Total Money Spent (All Time)</p>
            <p className="text-base sm:text-lg font-bold text-gray-900 break-words leading-tight">
              ₱{Number(totalMoneySpent || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
        </div>

        {/* Lost Money (All Time) */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-gray-500 text-xs font-medium mb-1.5">Lost Money (All Time)</p>
            <p className="text-base sm:text-lg font-bold text-gray-900 break-words leading-tight">
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
          <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          </div>
        </div>
      </div>

      {/* ===== SUPPLY HISTORY LIST ===== */}
      {loading ? (
        <div className="flex flex-col justify-center items-center min-h-[400px] bg-base-100 rounded-2xl">
          <Loader2 className="animate-spin w-12 h-12 text-primary mb-4" />
          <p className="text-base-content/60">Loading supply histories...</p>
        </div>
      ) : !supplyHistories?.length ? (
        <div className="bg-base-100 rounded-2xl shadow-lg border-2 border-base-300">
          <div className="text-center py-16">
            <div className="bg-base-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileWarning className="h-10 w-10 text-base-content/30" />
            </div>
            <h3 className="text-lg font-semibold text-base-content mb-2">
              No Supply Histories Found
            </h3>
            <p className="text-base-content/60">
              {hasDateFilter
                ? "No supply histories found for the selected date range"
                : "No supply histories have been created yet"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {supplyHistories.map((h) => {
            const isExpanded = expandedRow === h._id;
            const productName = h.product_variant?.product?.name || h.productName || "Unknown Product";
            const variantSize = h.product_variant?.size || h.variantSize || "";
            const variantUnit = h.product_variant?.unit || h.variantUnit || "";
            const variantColor = h.product_variant?.color || "";
            
            return (
              <div
                key={h._id}
                className="bg-white rounded-2xl shadow-md border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Main Card Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Left Section - Product Info */}
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          <Package className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                              {productName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {variantSize && (
                                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium">
                                  {variantSize}
                                </span>
                              )}
                              {variantUnit && (
                                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                                  {variantUnit}
                                </span>
                              )}
                              {variantColor && (
                                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-pink-50 text-pink-700 text-xs font-medium capitalize">
                                  {variantColor}
                                </span>
                              )}
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
                                {h.quantity} pcs
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Date and Price - Mobile */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm mt-2">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>
                              {new Date(h.supplied_at || h.createdAt).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-green-600">
                              ₱{h.total_cost?.toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                              }) || "0.00"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions (Desktop) */}
                    <div className="hidden lg:flex items-center gap-4">
                      {/* Expand Button */}
                      <button
                        onClick={() => toggleExpandedRow(h._id)}
                        className="btn btn-ghost btn-sm btn-circle"
                        aria-label="Toggle details"
                      >
                        <ChevronRight
                          className={`w-5 h-5 transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Mobile Actions */}
                    <div className="lg:hidden flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => toggleExpandedRow(h._id)}
                        className="btn btn-ghost btn-sm btn-circle ml-auto"
                        aria-label="Toggle details"
                      >
                        <ChevronRight
                          className={`w-5 h-5 transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Left Column - Pricing Details */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <h4 className="font-semibold text-sm text-gray-700">
                            Pricing Details
                          </h4>
                        </div>
                        <div className="bg-white rounded-xl border-2 border-gray-200 p-3 sm:p-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Supplier Price:</span>
                            <span className="font-mono text-sm font-bold text-gray-900">
                              ₱{h.supplier_price?.toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                              }) || "0.00"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <span className="font-semibold text-sm text-gray-900">
                              {h.quantity} pcs
                            </span>
                          </div>
                          <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-700">Total Cost:</span>
                            <span className="font-mono text-base font-bold text-green-600">
                              ₱{h.total_cost?.toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                              }) || "0.00"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Date Information */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <h4 className="font-semibold text-sm text-gray-700">
                            Date Information
                          </h4>
                        </div>

                        <div className="bg-white rounded-xl border-2 border-gray-200 p-3 sm:p-4 space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Date Supplied</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(h.supplied_at || h.createdAt).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Created At</p>
                            <p className="text-sm font-semibold text-gray-900">
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
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      )}
    </div>
  );
};

export default SupplyHistories;
