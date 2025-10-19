import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom";

const Modal = ({ children, isOpen, onClose, className = "" }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-gray-950/50 flex justify-center items-center z-50 p-4">
      <div
        ref={modalRef}
        className={`bg-[#222831] text-white rounded-2xl p-4 sm:p-6 relative w-full max-w-md sm:max-w-lg ${className}`}
      >
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default Modal;
