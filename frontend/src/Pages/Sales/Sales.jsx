import React, { useEffect, useState } from "react";
import { useSalesContext } from "../../hooks/useSaleContext";
import { useProductsContext } from "../../hooks/useProductContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useFetch } from "../../hooks/useFetch";
import Receipt from "../../components/Receipt";
import Pagination from "../../components/Pagination";
import { formatDatePHT } from "../../utils/formatDate";
import { formatPrice } from "../../utils/formatPrice";

const Sales = () => {
  const { sales, pages, dispatch } = useSalesContext();
  const { products } = useProductsContext();
  const { user } = useAuthContext();

  const [selectedSale, setSelectedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const limit = 20;

  console.log(sales);
  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const { data, loading, error } = useFetch(
    "/sales",
    {
      params: {
        page,
        limit,
        sortBy: "saleDate",
        sortOrder: "desc",
        search: debouncedSearch,
      },
      headers: { Authorization: `Bearer ${user?.token}` },
    },
    [page, debouncedSearch, user?.token]
  );

  useEffect(() => {
    if (data) {
      dispatch({
        type: "SET_SALES",
        payload: {
          sales: data.sales,
          total: data.total,
          page: data.page,
          pages: data.pages,
        },
      });
    }
  }, [data, dispatch]);

  const toggleExpandedRow = (saleId) => {
    setExpandedRow(expandedRow === saleId ? null : saleId);
  };

  // Handlers for search
  const handleSearchChange = (e) => setSearch(e.target.value);

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Sales</h1>
          <p className="text-base-content/70 mt-1">
            Track and manage sales transactions from POS and reservations
          </p>
        </div>

        {/* Search Bar */}
        <div className="form-control w-full max-w-xs">
          <input
            type="text"
            placeholder="Search sales..."
            className="input input-bordered w-full max-w-xs"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th></th>
                  <th className="font-semibold">Sale ID</th>
                  <th className="font-semibold">Cashier</th>
                  <th className="font-semibold">Sale Date</th>
                  <th className="font-semibold">Type & Status</th>
                  <th className="font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Loading State */}
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <span className="loading loading-spinner loading-lg"></span>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-error">
                      <p>Error loading sales data: {error}</p>
                    </td>
                  </tr>
                ) : sales && sales.length > 0 ? (
                  sales.map((sale) => (
                    <React.Fragment key={sale._id}>
                      <tr className="hover">
                        <td>
                          <button
                            className="btn btn-ghost btn-sm btn-circle"
                            onClick={() => toggleExpandedRow(sale._id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 transition-transform ${
                                expandedRow === sale._id ? "rotate-90" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </td>
                        <td>
                          <div className="font-mono font-semibold text-sm">
                            #{sale._id?.slice(-8) || "N/A"}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-bold text-sm">
                                {sale.cashier?.name || "Unknown Cashier"}
                              </div>
                              <div className="text-sm text-base-content/60">
                                {sale.cashier?.email || ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            {formatDatePHT(sale.saleDate)}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span
                              className={`badge ${
                                sale.type === "pos"
                                  ? "badge-primary"
                                  : "badge-secondary"
                              }`}
                            >
                              {sale.type?.toUpperCase()}
                            </span>
                            <span
                              className={`badge ${
                                sale.amountPaid >= sale.totalPrice
                                  ? "badge-success"
                                  : "badge-warning"
                              }`}
                            >
                              {sale.amountPaid >= sale.totalPrice
                                ? "PAID"
                                : "PARTIAL"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setSelectedSale(sale);
                                setShowReceipt(true);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                />
                              </svg>
                              Print
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedRow === sale._id && (
                        <tr>
                          <td colSpan="7" className="p-0">
                            <div className="bg-base-50 p-4 border-t">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                {/* Payment Info */}
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-semibold text-sm text-base-content mb-2">
                                      Payment Information
                                    </h4>
                                    <div className="bg-base-100 p-3 rounded space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-base-content/70">
                                          Total Price:
                                        </span>
                                        <span className="font-mono font-medium">
                                          {formatPrice(sale.totalPrice) || "0"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-base-content/70">
                                          Amount Paid:
                                        </span>
                                        <span className="font-mono font-medium">
                                          {formatPrice(sale.amountPaid) || "0"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm border-t pt-2">
                                        <span className="text-base-content/70">
                                          Change:
                                        </span>
                                        <span className="font-mono font-medium">
                                          {formatPrice(sale.change) || "0"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Items Sold */}
                                <div>
                                  <h4 className="font-semibold text-sm text-base-content mb-2">
                                    Items Sold
                                  </h4>
                                  {sale.items && sale.items.length > 0 ? (
                                    <div className="space-y-2">
                                      {sale.items.map((item, index) => {
                                        const matchedProduct = products?.find(
                                          (p) =>
                                            p._id ===
                                            (item.productId?._id ||
                                              item.productId)
                                        );

                                        // ✅ Show product name from populated data
                                        const productName =
                                          item.productVariantId?.product
                                            ?.name ||
                                          matchedProduct?.name ||
                                          item.productVariantId?.name ||
                                          `Product ID: ${item.productVariantId?._id}`;

                                        return (
                                          <div
                                            key={index}
                                            className="bg-base-100 p-3 rounded-lg border"
                                          >
                                            <div className="flex justify-between items-start">
                                              <div className="flex-1">
                                                <h5 className="font-medium text-sm">
                                                  {productName}
                                                </h5>
                                                <div className="text-xs text-base-content/60 mt-1 space-y-1">
                                                  <div className="flex gap-4">
                                                    <span>
                                                      Qty:{" "}
                                                      <span className="font-mono">
                                                        {item.quantity}
                                                      </span>
                                                    </span>
                                                    {item.unit && (
                                                      <span>
                                                        Unit:{" "}
                                                        <span className="badge badge-outline badge-xs">
                                                          {item.unit}
                                                        </span>
                                                      </span>
                                                    )}
                                                    {item.size && (
                                                      <span>
                                                        Size:{" "}
                                                        <span className="font-mono">
                                                          {item.size}
                                                        </span>
                                                      </span>
                                                    )}
                                                    <span>
                                                      Unit Price:{" "}
                                                      <span className="font-mono">
                                                        ₱
                                                        {item.price?.toLocaleString() ||
                                                          "0"}
                                                      </span>
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <div className="text-xs text-base-content/60">
                                                  Subtotal
                                                </div>
                                                <div className="font-mono text-sm font-medium">
                                                  ₱
                                                  {item.subtotal?.toLocaleString() ||
                                                    "0"}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-base-content/50">
                                      <p className="text-sm">
                                        No items available
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <p className="text-base-content/60">No sales found</p>
                      {debouncedSearch && (
                        <p className="text-xs text-base-content/40 mt-1">
                          Try adjusting your search terms
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <Pagination page={page} pages={pages} onPageChange={setPage} />

      {/* Receipt Modal */}
      {showReceipt && selectedSale && (
        <Receipt
          sale={selectedSale}
          products={products}
          onClose={() => {
            setShowReceipt(false);
            setSelectedSale(null);
          }}
        />
      )}
    </div>
  );
};

export default Sales;
