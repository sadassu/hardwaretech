import React, { useEffect, useState } from "react";
import { useSalesContext } from "../../hooks/useSaleContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useFetch } from "../../hooks/useFetch";
import Receipt from "../../components/Receipt";
import Pagination from "../../components/Pagination";
import { formatDatePHT } from "../../utils/formatDate";
import { formatPrice } from "../../utils/formatPrice";
import { Printer } from "lucide-react";

const Sales = () => {
  const { sales, pages, dispatch } = useSalesContext();
  const { user } = useAuthContext();

  const [selectedSale, setSelectedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  const limit = 20;

  // Debounce search
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

  const toggleExpandedRow = (saleId) =>
    setExpandedRow(expandedRow === saleId ? null : saleId);

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

        {/* Search */}
        <div className="form-control w-full max-w-xs">
          <input
            type="text"
            placeholder="Search sales..."
            className="input input-bordered w-full max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th></th>
                  <th>Sale ID</th>
                  <th>Cashier</th>
                  <th>Sale Date</th>
                  <th>Type & Status</th>
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
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-error">
                      Error loading sales data: {error}
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
                        <td className="font-mono text-sm font-semibold">
                          #{sale._id?.slice(-8)}
                        </td>
                        <td>
                          <div className="font-bold text-sm">
                            {sale.cashier?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-base-content/60">
                            {sale.cashier?.email || ""}
                          </div>
                        </td>
                        <td>{formatDatePHT(sale.saleDate)}</td>
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
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              setSelectedSale(sale);
                              setShowReceipt(true);
                            }}
                          >
                            <Printer />
                            Print
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedRow === sale._id && (
                        <tr>
                          <td colSpan="7" className="p-0">
                            <div className="bg-base-50 p-4 border-t">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Payment Info */}
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">
                                    Payment Information
                                  </h4>
                                  <div className="bg-base-100 p-3 rounded space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Total Price:</span>
                                      <span className="font-mono">
                                        {formatPrice(sale.totalPrice)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>Amount Paid:</span>
                                      <span className="font-mono">
                                        {formatPrice(sale.amountPaid)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t pt-2">
                                      <span>Change:</span>
                                      <span className="font-mono">
                                        {formatPrice(sale.change)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Items Sold */}
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">
                                    Items Sold
                                  </h4>
                                  {sale.items?.length ? (
                                    <div className="space-y-2">
                                      {sale.items.map((item, i) => {
                                        const variant = item.productVariantId;
                                        const product = variant?.product;
                                        return (
                                          <div
                                            key={i}
                                            className="bg-base-100 p-3 rounded border"
                                          >
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <h5 className="font-medium text-sm">
                                                  {product?.name ||
                                                    variant?.name ||
                                                    "Unnamed Product"}
                                                </h5>
                                                <div className="text-xs mt-1 space-x-3">
                                                  <span>
                                                    Qty: {item.quantity}
                                                  </span>
                                                  {item.unit && (
                                                    <span>
                                                      Unit: {item.unit}
                                                    </span>
                                                  )}
                                                  {item.size && (
                                                    <span>
                                                      Size: {item.size}
                                                    </span>
                                                  )}
                                                  <span>
                                                    Unit Price: ₱
                                                    {item.price?.toLocaleString()}
                                                  </span>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <div className="text-xs text-base-content/60">
                                                  Subtotal
                                                </div>
                                                <div className="font-mono text-sm font-medium">
                                                  ₱
                                                  {item.subtotal?.toLocaleString()}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-center text-sm text-base-content/60">
                                      No items available
                                    </p>
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

      <Pagination page={page} pages={pages} onPageChange={setPage} />

      {showReceipt && selectedSale && (
        <Receipt
          sale={selectedSale}
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
