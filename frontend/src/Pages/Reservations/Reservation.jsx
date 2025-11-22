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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-0 sm:p-4 lg:p-6">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Reservations
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base ml-0 sm:ml-[60px]">
            Manage customer reservations and orders
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, email, reservation ID, product name, or date..."
                value={localSearch}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400 transition-all"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </form>
        </div>

        {/* Filter cards (Pending, Completed, etc.) */}
        <StatusCards
          statusFilter={statusFilter}
          statusCounts={statusCounts}
          onStatusChange={handleStatusFilterChange}
        />

        {/* Reservation Table/Cards */}
        <ReservationTable />

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-6">
        <Pagination page={page} pages={pages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservation;
