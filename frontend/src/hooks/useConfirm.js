import { useCallback } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const baseOptions = {
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Yes, proceed",
  cancelButtonText: "Cancel",
  reverseButtons: true,
  focusCancel: true,
  confirmButtonColor: "#2563eb",
  cancelButtonColor: "#9ca3af",
};

export const useConfirm = () =>
  useCallback((options = {}) => {
    const { title, text, confirmButtonText, cancelButtonText, icon } = options;

    return Swal.fire({
      ...baseOptions,
      title: title || "Proceed with this action?",
      text:
        text ||
        "Please confirm to continue. Some actions cannot be undone.",
      icon: icon || baseOptions.icon,
      confirmButtonText: confirmButtonText || baseOptions.confirmButtonText,
      cancelButtonText: cancelButtonText || baseOptions.cancelButtonText,
    });
  }, []);

export default useConfirm;

