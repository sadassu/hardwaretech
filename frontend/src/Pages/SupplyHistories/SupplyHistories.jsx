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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* 💰 Total Spending (Last 7 Days) */}
        <div className="card bg-primary text-primary-content shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-sm uppercase opacity-80">
              Money Spent (Last 7 Days)
            </h2>
            <p className="text-3xl font-bold">
              ₱
              {Number(last7DaysSpending || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* 📦 Items Stocked (Last 7 Days) */}
        <div className="card bg-secondary text-secondary-content shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-sm uppercase opacity-80">
              Items Stocked (Last 7 Days)
            </h2>
            <p className="text-3xl font-bold">
              {Number(last7DaysItems || 0).toLocaleString()} 
            </p>
          </div>
        </div>

        {/* 🧮 Total Money Spent (All Time) */}
        <div className="card bg-accent text-accent-content shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-sm uppercase opacity-80">
              Total Money Spent (All Time)
            </h2>
            <p className="text-3xl font-bold">
              ₱
              {Number(totalMoneySpent || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
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
