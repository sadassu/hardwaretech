import React, { useState } from "react";
import Modal from "../../components/Modal";
import { useReservation } from "../../hooks/useReservation";

function UpdateReservationStatus({ reservation }) {
  const { updateReservationStatus } = useReservation();

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
      await updateReservationStatus(reservation._id, formData);

      setIsOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-sm btn-outline"
        onClick={() => setIsOpen(true)}
      >
        Edit status
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-[350px]"
      >
        <h2 className="text-xl font-semibold mb-4">Edit Status</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Status
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="select select-bordered w-full bg-[#30475E] text-white"
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
              className="btn bg-red-500 border-red-500 text-white"
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
