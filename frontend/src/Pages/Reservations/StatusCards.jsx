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
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
      hoverBorder: "hover:border-blue-400",
    },
    {
      key: "pending",
      label: "Pending",
      Icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      iconBg: "bg-amber-100",
      textColor: "text-amber-600",
      borderColor: "border-amber-200",
      hoverBorder: "hover:border-amber-400",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      Icon: CheckCircle,
      gradient: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50",
      iconBg: "bg-cyan-100",
      textColor: "text-cyan-600",
      borderColor: "border-cyan-200",
      hoverBorder: "hover:border-cyan-400",
    },
    {
      key: "completed",
      label: "Completed",
      Icon: CheckCheck,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-600",
      borderColor: "border-green-200",
      hoverBorder: "hover:border-green-400",
    },
    {
      key: "cancelled",
      label: "Cancelled/Failed",
      Icon: XCircle,
      gradient: "from-red-500 to-rose-600",
      bgColor: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      borderColor: "border-red-200",
      hoverBorder: "hover:border-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {statusCards.map((card) => {
        const IconComponent = card.Icon;
        const isActive = statusFilter === card.key;
        return (
          <button
            key={card.key}
            onClick={() => onStatusChange(card.key)}
            className={`group bg-white rounded-2xl shadow-md transition-all duration-300 overflow-hidden transform hover:-translate-y-1 hover:shadow-xl active:scale-95 ${
              isActive
                ? `border-2 ${card.borderColor} ring-2 ring-offset-2 ${card.textColor} ring-opacity-30`
                : `border-2 border-gray-100 ${card.hoverBorder}`
            }`}
          >
            {/* Top gradient stripe */}
            <div className={`h-1.5 bg-gradient-to-r ${card.gradient}`}></div>
            
            <div className="p-3 sm:p-4 lg:p-5">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div
                  className={`${card.iconBg} p-2 sm:p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                >
                  <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${card.textColor}`} />
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className={`w-2 h-2 rounded-full ${card.gradient} bg-gradient-to-r animate-pulse`}></div>
                )}
              </div>
              
              <div>
                <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${card.textColor} mb-1 group-hover:scale-105 transition-transform`}>
                  {statusCounts?.[card.key] || 0}
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  {card.label}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default StatusCards;
