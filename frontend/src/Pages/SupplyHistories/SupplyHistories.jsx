import React, { useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { useAuthContext } from "../../hooks/useAuthContext";
import Pagination from "../../components/Pagination";
import SearchBar from "../../components/SearchBar";

const SupplyHistories = () => {
  const { user } = useAuthContext();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState(""); // debounced search term
  const [histories, setHistories] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
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

  // Fetch supply histories
  const { data, loading, error } = useFetch(
    "/supply-histories",
    {
      params: {
        page,
        limit,
        search: query,
        sortBy: "supplied_at",
        sortOrder: "desc",
      },
      headers: { Authorization: `Bearer ${user?.token}` },
    },
    [page, query, user?.token]
  );

  // Update state when new data arrives
  useEffect(() => {
    if (data) {
      setHistories(data.histories || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    }
  }, [data]);

  // Handlers for SearchBar
  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleClearSearch = () => setSearch("");

  return (
    <div className="container mx-auto p-6">
      {/* Header + Search */}
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
          onSearchChange={handleSearchChange}
          onClear={handleClearSearch}
          isSearching={isSearching}
          placeholder="Search product name..."
        />
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Date Supplied</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
              ) : histories.length > 0 ? (
                histories.map((h) => (
                  <tr key={h._id}>
                    <td>
                      {h.product_variant?.product?.name || "Unknown Product"}
                    </td>
                    <td>
                      <span className="badge badge-success badge-outline">
                        {h.quantity} pcs
                      </span>
                    </td>
                    <td>
                      {new Date(h.supplied_at).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-12">
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

      {/* Pagination */}
      {pages > 1 && (
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      )}
    </div>
  );
};

export default SupplyHistories;
