import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react"; // ✅ Import Lucide icon

const Modal = ({ children, isOpen, onClose, className = "", hideCloseButton = false }) => {
  const modalRef = useRef(null);
  const isProtectedRef = useRef(false);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Protect modal from closing for the first 1500ms after opening
      // This prevents it from closing when variant modal closes
      isProtectedRef.current = true;
      const protectionTimer = setTimeout(() => {
        isProtectedRef.current = false;
      }, 1500);
      
      return () => {
        clearTimeout(protectionTimer);
        document.body.style.overflow = "";
        isProtectedRef.current = false;
      };
    } else {
      document.body.style.overflow = "";
      isProtectedRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if modal is still protected
      if (isProtectedRef.current) return;
      
      // Only close if clicking directly on the backdrop
      if (
        modalRef.current && 
        !modalRef.current.contains(event.target) &&
        event.target === event.currentTarget
      ) {
        onClose();
      }
    };

    if (isOpen) {
      // Add event listener after protection period (longer delay)
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 1500);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const portalRoot = document.getElementById("modal-root") || document.body;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[10000] p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        // Don't close if modal is still protected - CRITICAL
        if (isProtectedRef.current) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        // Only close if clicking directly on backdrop (not on modal content)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }} // Prevent event propagation to other modals
    >
      <div
        ref={modalRef}
        className={`relative w-full my-8 ${className || 'bg-[#222831] text-white rounded-2xl p-4 sm:p-6 max-w-md sm:max-w-lg'}`}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        {/* ✅ Close Button - Only show if not using custom className and not hidden */}
        {!className && !hideCloseButton && (
        <button
          onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        )}
        
        {/* Close button for custom styled modals */}
        {className && !hideCloseButton && (
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
    portalRoot
  );
};

export default Modal;
