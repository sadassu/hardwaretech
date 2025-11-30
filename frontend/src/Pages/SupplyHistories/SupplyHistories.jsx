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
  const limit = 10;

  const isMobile = useIsMobile(768);
  const supplyLiveKey = useLiveResourceRefresh(["supply", "inventory"]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="shadow-lg rounded-xl overflow-hidden bg-[#30475E] p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium mb-1 text-white">
              Money Spent (Last 7 Days)
            </p>
            <h3 className="text-3xl font-bold text-white">
              ₱
              {Number(last7DaysSpending || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </h3>
          </div>
          <div className="p-3 rounded-lg bg-white/10">
            <Clock className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="shadow-lg rounded-xl overflow-hidden bg-[#1F2937] p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium mb-1 text-white">
              Total Stock On Hand
            </p>
            <h3 className="text-3xl font-bold text-white">
              {Number(totalStock || 0).toLocaleString()}
              <span className="text-base ml-1 font-medium">pcs</span>
            </h3>
            <p className="text-xs text-white/70 mt-1">
              Includes all active product variants
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/10">
            <Boxes className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="shadow-lg rounded-xl overflow-hidden bg-[#F05454] p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium mb-1 text-white">
              Total Money Spent (All Time)
            </p>
            <h3 className="text-3xl font-bold text-white">
              ₱
              {Number(totalMoneySpent || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </h3>
          </div>
          <div className="p-3 rounded-lg bg-white/10">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="shadow-lg rounded-xl overflow-hidden bg-[#7A1B1D] p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium mb-1 text-white">
              Lost Money (All Time)
            </p>
            <h3 className="text-3xl font-bold text-white">
              ₱
              {Number(lostMoney.total || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <p className="text-xs text-white/80 mt-1">
              Last 7 days: ₱
              {Number(lostMoney.last7 || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/10">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* ===== RESPONSIVE VIEW ===== */}
      {isMobile ? (
        // ===== CARD VIEW =====
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : supplyHistories.length > 0 ? (
            supplyHistories.map((h) => (
              <div
                key={h._id}
                className="card bg-base-100 shadow-md border border-base-300 p-4 rounded-xl"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">
                      {h.product_variant?.product?.name || h.productName || "Unknown"}
                    </h3>
                    <p className="text-sm text-base-content/70">
                      {h.product_variant?.size || h.variantSize
                        ? `${h.product_variant?.size || h.variantSize} ${
                            h.product_variant?.unit || h.variantUnit || ""
                          }`
                        : h.product_variant?.unit || h.variantUnit || ""}
                    </p>
                  </div>
                  <span className="badge badge-success badge-outline">
                    {h.quantity} pcs
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <p>
                    <strong>Supplier Price:</strong> ₱
                    {h.supplier_price?.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p>
                    <strong>Total Cost:</strong> ₱
                    {h.total_cost?.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p>
                    <strong>Date Supplied:</strong>{" "}
                    {new Date(h.createdAt).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>
                    <strong>Notes:</strong>{" "}
                    {h.notes || (
                      <span className="text-base-content/50 italic">
                        No notes
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-base-content/60 py-12">
              {hasDateFilter
                ? "No supply histories found for the selected date range"
                : "No supply histories found"}
            </p>
          )}
        </div>
      ) : (
        // ===== TABLE VIEW =====
        <div className="card bg-base-100 shadow-xl">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Supplier Price</th>
                  <th>Total Cost</th>
                  <th>Date Supplied</th>
                  <th>Created At</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <span className="loading loading-spinner loading-lg"></span>
                    </td>
                  </tr>
                ) : supplyHistories.length > 0 ? (
                  supplyHistories.map((h) => (
                    <tr key={h._id}>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {h.product_variant?.product?.name || h.productName || "Unknown"}
                          </span>
                          <span className="text-sm text-base-content/70">
                            {h.product_variant?.size || h.variantSize
                              ? `${h.product_variant?.size || h.variantSize} ${
                                  h.product_variant?.unit || h.variantUnit || ""
                                }`
                              : h.product_variant?.unit || h.variantUnit || ""}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-success badge-outline">
                          {h.quantity} pcs
                        </span>
                      </td>
                      <td>
                        ₱
                        {h.supplier_price?.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        ₱
                        {h.total_cost?.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        {new Date(h.supplied_at).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td>
                        <div className="text-sm">
                          {new Date(h.createdAt).toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                          <div className="text-xs text-base-content/60">
                            {new Date(h.createdAt).toLocaleTimeString("en-PH", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="max-w-xs truncate">
                        {h.notes || (
                          <span className="text-base-content/50 italic">
                            No notes
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <p className="text-base-content/60">
                        {hasDateFilter
                          ? "No supply histories found for the selected date range"
                          : "No supply histories found"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pages > 1 && (
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      )}
    </div>
  );
};

export default SupplyHistories;
