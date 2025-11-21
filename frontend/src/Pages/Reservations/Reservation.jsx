import React from "react";
import { ClipboardList } from "lucide-react";
import { useReservationStore } from "../../store/reservationStore";
import Pagination from "../../components/Pagination";
import StatusCards from "./StatusCards";
import ReservationTable from "./ReservationTable";

const Reservation = () => {
  const { page, pages, statusFilter, statusCounts, setPage, setStatusFilter } =
    useReservationStore();

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
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
