import { useCallback } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export const useQuickToast = () =>
  useCallback((options = {}) => {
    const { title, text, icon, position } = options;
    return Swal.fire({
      toast: true,
      position: position || "top-end",
      icon: icon || "success",
      title: title || "",
      text: text || "",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  }, []);

export default useQuickToast;

