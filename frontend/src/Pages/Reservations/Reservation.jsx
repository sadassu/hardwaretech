import React from "react";
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
    <div className="min-h-screen p-4 lg:p-2">
      <div className="container mx-auto p-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-base-content">Reservations</h1>
          <p className="text-base-content/70 mt-2">
            Manage customer reservations and orders
          </p>
        </div>

        {/* Filter cards (Pending, Completed, etc.) */}
        <StatusCards
          statusFilter={statusFilter}
          statusCounts={statusCounts}
          onStatusChange={handleStatusFilterChange}
        />

        {/* 🧠 Only this section reloads data */}
        <ReservationTable />

        {/* Pagination */}
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default Reservation;
