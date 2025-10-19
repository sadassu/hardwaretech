// src/components/StatusCards.jsx
import React from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  CheckCheck,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const StatusCards = ({ statusFilter, statusCounts, onStatusChange }) => {
  const statusCards = [
    {
      key: "all",
      label: "All",
      Icon: ClipboardList,
      color: "bg-base-200 hover:bg-base-300",
      activeColor: "bg-primary text-primary-content",
    },
    {
      key: "pending",
      label: "Pending",
      Icon: Clock,
      color: "bg-warning/10 hover:bg-warning/20",
      activeColor: "bg-warning text-warning-content",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      Icon: CheckCircle,
      color: "bg-info/10 hover:bg-info/20",
      activeColor: "bg-info text-info-content",
    },
    {
      key: "completed",
      label: "Completed",
      Icon: CheckCheck,
      color: "bg-success/10 hover:bg-success/20",
      activeColor: "bg-success text-success-content",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      Icon: XCircle,
      color: "bg-error/10 hover:bg-error/20",
      activeColor: "bg-error text-error-content",
    },
    {
      key: "failed",
      label: "Failed",
      Icon: AlertTriangle,
      color: "bg-error/10 hover:bg-error/20",
      activeColor: "bg-error text-error-content",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      {statusCards.map((card) => {
        const IconComponent = card.Icon;
        const isActive = statusFilter === card.key;
        return (
          <button
            key={card.key}
            onClick={() => onStatusChange(card.key)}
            className={`card ${
              isActive ? card.activeColor : card.color
            } shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer`}
          >
            <div className="card-body p-3 md:p-4">
              <div className="flex items-center justify-between">
                <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
                <div className="text-right">
                  <p className="text-lg md:text-2xl font-bold">
                    {statusCounts?.[card.key] || 0}
                  </p>
                  <p className="text-xs md:text-sm opacity-80">{card.label}</p>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default StatusCards;
