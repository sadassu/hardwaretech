import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Pagination from "../../components/Pagination";
import SearchBar from "../../components/SearchBar";
import { useSupplyHistoryStore } from "../../store/supplyHistoryStore";
import Modal from "../../components/Modal";
import RedoModal from "./RedoModal";

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
        {/* Money Spent (Last 7 Days) */}
        <div
          className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden"
          style={{ backgroundColor: "#30475E" }}
        >
          <div className="p-6 flex items-center justify-between">
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
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Items Stocked (Last 7 Days) */}
        <div
          className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden"
          style={{ backgroundColor: "#222831" }}
        >
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1 text-white">
                Items Stocked (Last 7 Days)
              </p>
              <h3 className="text-3xl font-bold text-white">
                {Number(last7DaysItems || 0).toLocaleString()}
              </h3>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Money Spent (All Time) */}
        <div
          className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden"
          style={{ backgroundColor: "#F05454" }}
        >
          <div className="p-6 flex items-center justify-between">
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
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABLE ===== */}
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

      {pages > 1 && (
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      )}
    </div>
  );
};

export default SupplyHistories;
