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
  // Ensure it appears above all modals (cart modal uses z-[9999])
  // Use didOpen to set z-index after SweetAlert2 renders
  didOpen: () => {
    // Set z-index for the container to appear above modals
    setTimeout(() => {
      const swalContainer = document.querySelector('.swal2-container');
      if (swalContainer) {
        swalContainer.style.zIndex = '10001';
      }
      // Also set for backdrop
      const swalBackdrop = document.querySelector('.swal2-backdrop-show');
      if (swalBackdrop) {
        swalBackdrop.style.zIndex = '10000';
      }
    }, 10);
  },
};

export const useConfirm = () =>
  useCallback((options = {}) => {
    const { title, text, confirmButtonText, cancelButtonText, icon, didOpen: customDidOpen } = options;

    // Combine didOpen callbacks if custom one is provided
    const didOpen = () => {
      // Always set z-index first
      baseOptions.didOpen();
      // Then call custom didOpen if provided
      if (customDidOpen) {
        customDidOpen();
      }
    };

    return Swal.fire({
      ...baseOptions,
      title: title || "Proceed with this action?",
      text:
        text ||
        "Please confirm to continue. Some actions cannot be undone.",
      icon: icon || baseOptions.icon,
      confirmButtonText: confirmButtonText || baseOptions.confirmButtonText,
      cancelButtonText: cancelButtonText || baseOptions.cancelButtonText,
      didOpen: customDidOpen ? didOpen : baseOptions.didOpen,
    });
  }, []);

export default useConfirm;

