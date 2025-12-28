import React, { useState } from "react";
import { Edit3 } from "lucide-react";
import Modal from "../../components/Modal";
import { useReservation } from "../../hooks/useReservation";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

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

  const confirm = useConfirm();
  const quickToast = useQuickToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await confirm({
      title: "Update reservation status?",
      text: `Set reservation to "${formData.status}"?`,
      confirmButtonText: "Yes, update status",
    });
    if (!result.isConfirmed) return;

    try {
      await updateReservationStatus(reservation._id, formData);

      setIsOpen(false);
      quickToast({
        title: "Reservation updated",
        icon: "success",
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-sm btn-circle btn-ghost text-black hover:text-gray-700 border-0 transition-all duration-200"
        onClick={() => setIsOpen(true)}
        title="Edit Status"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="bg-white rounded-2xl max-w-md w-full p-0"
      >
        <div className="bg-red-400 p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Edit3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Update Status</h2>
              <p className="text-red-100 text-sm">Change reservation status</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select New Status
            </label>
            
            <div className="space-y-2">
              <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.status === 'pending' 
                  ? 'border-amber-500 bg-amber-50' 
                  : 'border-gray-200 hover:border-amber-300 bg-white'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={formData.status === 'pending'}
                  onChange={handleChange}
                  className="radio radio-warning mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-semibold text-gray-900">Pending</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
                </div>
              </label>

              <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.status === 'confirmed' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300 bg-white'
              }`}>
                <input
                  type="radio"
              name="status"
                  value="confirmed"
                  checked={formData.status === 'confirmed'}
              onChange={handleChange}
                  className="radio radio-info mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="font-semibold text-gray-900">Confirmed</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ready to proceed</p>
                </div>
          </label>

              <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.status === 'cancelled' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:border-red-300 bg-white'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="cancelled"
                  checked={formData.status === 'cancelled'}
                  onChange={handleChange}
                  className="radio radio-error mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="font-semibold text-gray-900">Cancelled</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Reservation cancelled</p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 btn btn-ghost border-2 border-gray-200 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn bg-red-400 text-white border-0 hover:bg-red-500 shadow-lg transition-colors duration-200"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default UpdateReservationStatus;
