import { createContext, useContext, useState } from "react";
import StatusToast from "../components/StatusToast";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    show: false,
    color: "border-green-500 bg-green-100 text-green-700",
    header: "",
    message: "",
  });

  return (
    <ToastContext.Provider value={setToast}>
      {children}

      <StatusToast
        show={toast.show}
        color={toast.color}
        header={toast.header}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </ToastContext.Provider>
  );
}

// Hook to easily access setToast
export function useToast() {
  return useContext(ToastContext);
}
