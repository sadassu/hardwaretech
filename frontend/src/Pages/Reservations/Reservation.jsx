import React, { useEffect, useState } from "react";
import { useReservationsContext } from "../../hooks/useReservationContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useFetch } from "../../hooks/useFetch";
import UpdateReservationStatus from "./UpdateReservationStatus";

const Reservation = () => {
  const { reservations, pages, dispatch } = useReservationsContext();
  const { user } = useAuthContext();

  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, loading, error } = useFetch(
    "/reservations",
    {
      params: { page, limit, sortBy: "reservationDate", sortOrder: "asc" },
      headers: { Authorization: `Bearer ${user?.token}` },
    },
    [page, user?.token]
  );

  useEffect(() => {
    if (data) {
      dispatch({
        type: "SET_RESERVATIONS",
        payload: {
          reservations: data.reservations,
          total: data.total,
          page: data.page,
          pages: data.pages,
        },
      });
    }
  }, [data, dispatch]);

  if (loading) return <div className="flex justify-center p-6">Loading...</div>;
  if (error) return <div className="text-red-500 p-6">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reservations</h1>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Reservation Date</th>
              <th>Notes</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reservations && reservations.length > 0 ? (
              reservations.map((res) => (
                <tr key={res._id}>
                  <td className="font-medium">{res.userId?.name}</td>
                  <td>{res.userId?.email}</td>
                  <td>
                    {new Date(res.reservationDate).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>{res.notes || "-"}</td>
                  <td>₱{res.totalPrice?.toLocaleString()}</td>
                  <td>{res.status}</td>
                  <td>
                    <UpdateReservationStatus
                      reservation={res}
                      onUpdateSuccess={(updated) =>
                        dispatch({
                          type: "UPDATE_RESERVATION",
                          payload: updated,
                        })
                      }
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No reservations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="btn btn-sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button
          className="btn btn-sm"
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page === pages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Reservation;
