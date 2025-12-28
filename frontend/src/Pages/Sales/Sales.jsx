import React, { useEffect, useState } from "react";
import { useSalesContext } from "../../hooks/useSaleContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useFetch } from "../../hooks/useFetch";
import { useLiveResourceRefresh } from "../../hooks/useLiveResourceRefresh";
import useKeyboardPagination from "../../hooks/useKeyboardPagination";
import Receipt from "../../components/Receipt";
import Pagination from "../../components/Pagination";
import { formatDatePHT } from "../../utils/formatDate";
import { formatPrice } from "../../utils/formatPrice";
import { Printer, RotateCcw, Download, TrendingUp } from "lucide-react";
import api from "../../utils/api";
import ReturnSales from "./ReturnSales";

const Sales = () => {
  const { sales, pages, dispatch } = useSalesContext();
  const { user } = useAuthContext();

  const [selectedSale, setSelectedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Add keyboard pagination
  useKeyboardPagination(page, pages, setPage);

  // New filter states
  const [search, setSearch] = useState("");
  const [cashierFilter, setCashierFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const limit = 20;
  const salesLiveKey = useLiveResourceRefresh(["sales", "reservations", "inventory"]);

  const { data, loading, error } = useFetch(
    "/sales",
    {
      params: {
        page,
        limit,
        sortBy: "saleDate",
        sortOrder: "desc",
        // include filters in request (backend should handle empty strings/undefined)
        search: search || undefined,
        cashier: cashierFilter || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      },
      headers: { Authorization: `Bearer ${user?.token}` },
    },
    // Add filters to dependency array so fetch re-runs when they change
    [
      page,
      user?.token,
      search,
      cashierFilter,
      typeFilter,
      statusFilter,
      dateFrom,
      dateTo,
      salesLiveKey,
    ]
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

  const handleExportSales = async () => {
    try {
      // Build query parameters from current filters
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (cashierFilter) params.append("cashier", cashierFilter);
      if (typeFilter) params.append("type", typeFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const queryString = params.toString();
      const url = `/sales/export${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${user?.token}` },
        responseType: "blob", // Important for file download
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: "text/csv" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      
      // Generate filename with date range if applicable
      let filename = "sales-export";
      if (dateFrom || dateTo) {
        const from = dateFrom || "all";
        const to = dateTo || "all";
        filename = `sales-export-${from}-to-${to}`;
      } else {
        filename = `sales-export-${new Date().toISOString().split("T")[0]}`;
      }
      link.download = `${filename}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error exporting sales:", error);
      alert("Failed to export sales. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" tabIndex="0">
      <div className="w-full px-2 sm:px-3 lg:px-3 xl:px-4 py-2 sm:py-3 ml-4 sm:ml-6 lg:ml-8 transform scale-98 origin-top-left">
      {/* Header */}
      <div className="mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-400 rounded-lg shadow-md flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
                Sales
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block">
                Track and manage sales transactions from POS and reservations
              </p>
            </div>
          </div>
          <button
            onClick={handleExportSales}
            disabled={loading}
            className="btn btn-sm gap-1.5 mt-2 sm:mt-0 bg-yellow-400 hover:bg-yellow-500 text-white border-yellow-400 hover:border-yellow-500"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search sale ID, product..."
            className="input input-xs sm:input-sm input-bordered"
          />

          <input
            type="text"
            value={cashierFilter}
            onChange={(e) => {
              setCashierFilter(e.target.value);
              setPage(1);
            }}
            placeholder="Cashier name or email"
            className="input input-xs sm:input-sm input-bordered"
          />

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="select select-xs sm:select-sm select-bordered"
          >
            <option value="">All Types</option>
            <option value="pos">POS</option>
            <option value="reservation">Reservation</option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="input input-xs sm:input-sm input-bordered"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="input input-xs sm:input-sm input-bordered"
          />

          <button
            className="btn btn-xs sm:btn-sm btn-ghost"
            onClick={() => {
              setSearch("");
              setCashierFilter("");
              setTypeFilter("");
              setStatusFilter("");
              setDateFrom("");
              setDateTo("");
              setPage(1);
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th></th>
                  <th>Sale ID</th>
                  <th>Cashier/Owner</th>
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
                        <td className="text-sm font-semibold">
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
                          <span className="text-xs font-medium text-gray-700">
                            {sale.type?.toUpperCase() || "N/A"}{" "}
                            /{" "}
                            {sale.amountPaid >= sale.totalPrice ? "PAID" : "PARTIAL"}
                          </span>
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
                              <Printer />
                              Print
                            </button>
                            <ReturnSales sale={sale} />
                          </div>
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
                                      <span>
                                        {formatPrice(sale.totalPrice)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>Amount Paid:</span>
                                      <span>
                                        {formatPrice(sale.amountPaid)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t pt-2">
                                      <span>Change:</span>
                                      <span>
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
                                                    item.productName ||
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
                                                  {variant?.dimension && (
                                                    <span>
                                                      Dimension: {variant.dimension}
                                                    </span>
                                                  )}
                                                  {variant?.dimensionType && (
                                                    <span>
                                                      Dimension Type: {variant.dimensionType}
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
                                                <div className="text-sm font-medium">
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
                      {
                        <p className="text-xs text-base-content/40 mt-1">
                          Try adjusting your search terms
                        </p>
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {pages > 1 && (
        <div className="flex justify-center mt-6 w-full">
          <Pagination page={page} pages={pages} onPageChange={setPage} variant="yellow" />
        </div>
      )}

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
    </div>
  );
};

export default Sales;
