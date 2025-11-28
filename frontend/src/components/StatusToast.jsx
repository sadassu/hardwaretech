import { useEffect, useState } from "react";

function StatusToast({ color, header, message, show, onClose }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose(), 300);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] transition-opacity duration-300 animate-fade-in">
      <div className={`p-4 rounded-lg shadow-lg border-l-4 ${color}`}>
        <h2 className="text-lg font-semibold">{header}</h2>
        <p className="text-sm mt-2">{message}</p>
      </div>
    </div>
  );
}

export default StatusToast;
