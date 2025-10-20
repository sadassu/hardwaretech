import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Pagination from "../../components/Pagination";
import SearchBar from "../../components/SearchBar";
import { useSupplyHistoryStore } from "../../store/supplyHistoryStore";
import RedoModal from "./RedoModal";
import { Clock, Package, TrendingUp } from "lucide-react";
import { useIsMobile } from "../../hooks/useIsMobile"; // 👈 import your hook

const SupplyHistories = () => {
  const { user } = useAuthContext();
  const {
    supplyHistories,
    pages,
    loading,
    fetchSupplyHistories,
    redoSupplyHistory,
    getLast7DaysSpending,
    getLast7DaysItems,
    getTotalMoneySpent,
  } = useSupplyHistoryStore();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const limit = 10;

  const isMobile = useIsMobile(768); // 👈 dynamically detect screen size

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
      fetchSupplyHistories({ token: user.token, page, limit, search: query });
    }
  }, [page, query, user?.token]);

  // 💰 Computed stats
  const last7DaysSpending = getLast7DaysSpending()?.toFixed(2);
  const last7DaysItems = getLast7DaysItems();
  const totalMoneySpent = getTotalMoneySpent()?.toFixed(2);

  return (
    <div className="container mx-auto p-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
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

      {/* ===== ANALYTICS CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

        <div className="shadow-lg rounded-xl overflow-hidden bg-[#222831] p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium mb-1 text-white">
              Items Stocked (Last 7 Days)
            </p>
            <h3 className="text-3xl font-bold text-white">
              {Number(last7DaysItems || 0).toLocaleString()}
            </h3>
          </div>
          <div className="p-3 rounded-lg bg-white/10">
            <Package className="h-8 w-8 text-white" />
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
                      {h.product_variant?.product?.name || "Unknown"}
                    </h3>
                    <p className="text-sm text-base-content/70">
                      {h.product_variant?.size
                        ? `${h.product_variant.size} ${
                            h.product_variant.unit || ""
                          }`
                        : h.product_variant?.unit || ""}
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
                    <strong>Date:</strong>{" "}
                    {new Date(h.supplied_at).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
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

                <div className="mt-3 flex justify-end">
                  <RedoModal
                    user={user}
                    history={h}
                    redoSupplyHistory={redoSupplyHistory}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-base-content/60 py-12">
              No supply histories found
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
                  <th>Notes</th>
                  <th>Actions</th>
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
                            {h.product_variant?.product?.name || "Unknown"}
                          </span>
                          <span className="text-sm text-base-content/70">
                            {h.product_variant?.size
                              ? `${h.product_variant.size} ${
                                  h.product_variant.unit || ""
                                }`
                              : h.product_variant?.unit || ""}
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
                      <td className="max-w-xs truncate">
                        {h.notes || (
                          <span className="text-base-content/50 italic">
                            No notes
                          </span>
                        )}
                      </td>
                      <td>
                        <RedoModal
                          user={user}
                          history={h}
                          redoSupplyHistory={redoSupplyHistory}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <p className="text-base-content/60">
                        No supply histories found
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
