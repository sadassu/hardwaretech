import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react"; // ✅ Import Lucide icon

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div
        ref={modalRef}
        className={`relative w-full my-8 ${className || 'bg-[#222831] text-white rounded-2xl p-4 sm:p-6 max-w-md sm:max-w-lg'}`}
      >
        {/* ✅ Close Button - Only show if not using custom className */}
        {!className && (
        <button
          onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        )}
        
        {/* Close button for custom styled modals */}
        {className && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full p-1.5 shadow-lg"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}

        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default Modal;
