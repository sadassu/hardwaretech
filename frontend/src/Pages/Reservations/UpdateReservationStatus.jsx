import React, { useState } from "react";
import { useReservationsContext } from "../../hooks/useReservationContext";
import Modal from "../../components/Modal";
import { useAuthContext } from "../../hooks/useAuthContext";
import api from "../../utils/api";

function UpdateReservationStatus({ reservation, onUpdateSuccess }) {
  const { dispatch } = useReservationsContext();
  const { user } = useAuthContext();

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    status: reservation.status,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.put(
        `/reservations/${reservation._id}/status`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const updatedReservation = res.data.reservation || res.data;

      dispatch({
        type: "UPDATE_RESERVATION",
        payload: updatedReservation,
      });

      setIsOpen(false);
      if (onUpdateSuccess) onUpdateSuccess(updatedReservation);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn w-full btn-primary"
        onClick={() => setIsOpen(true)}
      >
        Edit status
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Edit Status</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Status
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default UpdateReservationStatus;
