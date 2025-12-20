import React, { useState, useEffect } from "react";
import { ClipboardList, Search, X } from "lucide-react";
import { useReservationStore } from "../../store/reservationStore";
import Pagination from "../../components/Pagination";
import StatusCards from "./StatusCards";
import ReservationTable from "./ReservationTable";

const Reservation = () => {
  const { page, pages, statusFilter, statusCounts, searchQuery, setPage, setStatusFilter, setSearchQuery } =
    useReservationStore();
  const [localSearch, setLocalSearch] = useState(searchQuery || "");

  // Sync localSearch with searchQuery from store
  useEffect(() => {
    setLocalSearch(searchQuery || "");
  }, [searchQuery]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    setSearchQuery("");
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
                <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
                  Reservations
                </h1>
                <p className="text-xs text-gray-600 hidden sm:block">
                  Manage customer reservations and orders
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full sm:w-auto gap-2 sm:ml-auto max-w-xl"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reservations"
                  value={localSearch}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-gray-900 placeholder-gray-400 transition-all text-sm"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 flex-shrink-0 text-sm"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>
          </div>
        </div>

        {/* Filter cards (Pending, Completed, etc.) */}
        <div className="mb-4">
          <StatusCards
            statusFilter={statusFilter}
            statusCounts={statusCounts}
            onStatusChange={handleStatusFilterChange}
          />
        </div>

        {/* Reservation Table/Cards */}
        <ReservationTable />

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-4">
        <Pagination page={page} pages={pages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservation;
