import React, { useState } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";
import Modal from "../../components/Modal";
import { useToast } from "../../context/ToastContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import api from "../../utils/api";
import { useSalesContext } from "../../hooks/useSaleContext";
import { useConfirm } from "../../hooks/useConfirm";

const ReturnSales = ({ sale }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const setToast = useToast();
  const { user } = useAuthContext();
  const { dispatch } = useSalesContext();
  const confirm = useConfirm();

  const handleReturn = async () => {
    if (!user) return;

    const result = await confirm({
      title: "Return this sale?",
      text: "Items will be sent back to inventory and the sale will be marked as returned.",
      confirmButtonText: "Yes, return sale",
      icon: "warning",
    });
    if (!result.isConfirmed) return;

    setIsReturning(true);
    try {
      // ✅ Fixed: headers must be second argument
      await api.post(
        `/sales/return/${sale._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setToast({
        show: true,
        color: "border-green-500 bg-green-100 text-green-700",
        header: "Success",
        message: "Sale returned successfully.",
      });

      const refreshed = await api.get("/sales", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      dispatch({
        type: "SET_SALES",
        payload: {
          sales: refreshed.data.sales,
          total: refreshed.data.total,
          page: refreshed.data.page,
          pages: refreshed.data.pages,
        },
      });
    } catch (error) {
      console.error("Return sale error:", error);
      setToast({
        show: true,
        color: "border-red-500 bg-red-100 text-red-700",
        header: "Error",
        message: error.response?.data?.message || "Failed to return sale.",
      });
    } finally {
      setIsReturning(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="inline-block">
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-sm btn-ghost gap-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
        title="Return Sale"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="hidden sm:inline">Return</span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="text-center p-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Confirm Return</h3>
          <p className="text-sm text-gray-300 mb-6">
            Are you sure you want to return sale{" "}
            <span className="font-medium text-red-400">
              #{sale?._id?.slice(-8)}
            </span>
            ?<br />
            This will return items to inventory.
          </p>

          <div className="flex justify-center gap-3">
            <button
              className="btn btn-ghost"
              onClick={() => setIsOpen(false)}
              disabled={isReturning}
            >
              Cancel
            </button>
            <button
              className="btn btn-error"
              onClick={handleReturn}
              disabled={isReturning}
            >
              {isReturning ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Confirm Return"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReturnSales;
