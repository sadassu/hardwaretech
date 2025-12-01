// components/ReservationUpdateHistory.jsx
import React from "react";
import { Clock, User, CheckCircle, XCircle, Edit, DollarSign, FileText, Package } from "lucide-react";
import { useReservationUpdates } from "../hooks/useReservationUpdates";
import { Loader2 } from "lucide-react";

const getUpdateIcon = (updateType) => {
  const icons = {
    created: CheckCircle,
    status_changed: Edit,
    details_updated: Package,
    remarks_updated: FileText,
    cancelled: XCircle,
    completed: CheckCircle,
    total_price_changed: DollarSign,
  };
  return icons[updateType] || Clock;
};

const getUpdateColor = (updateType) => {
  const colors = {
    created: "text-green-600 bg-green-50 border-green-200",
    status_changed: "text-blue-600 bg-blue-50 border-blue-200",
    details_updated: "text-purple-600 bg-purple-50 border-purple-200",
    remarks_updated: "text-orange-600 bg-orange-50 border-orange-200",
    cancelled: "text-red-600 bg-red-50 border-red-200",
    completed: "text-green-600 bg-green-50 border-green-200",
    total_price_changed: "text-yellow-600 bg-yellow-50 border-yellow-200",
  };
  return colors[updateType] || "text-gray-600 bg-gray-50 border-gray-200";
};

const formatUpdateType = (updateType) => {
  return updateType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ReservationUpdateHistory = ({ reservationId }) => {
  const { updates, loading, error, refreshUpdates } = useReservationUpdates(reservationId, true);
  
  // Refresh updates when reservation updates occur via WebSocket
  React.useEffect(() => {
    const handleLiveUpdate = (event) => {
      const detail = event.detail;
      // Check if this update is related to reservations
      if (detail.topics?.includes("reservations") || detail.path?.includes("/reservations")) {
        // Refresh the update history
        refreshUpdates();
      }
    };
    
    window.addEventListener("live-update", handleLiveUpdate);
    window.addEventListener("live-update:reservations", handleLiveUpdate);
    
    return () => {
      window.removeEventListener("live-update", handleLiveUpdate);
      window.removeEventListener("live-update:reservations", handleLiveUpdate);
    };
  }, [refreshUpdates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600 mr-2" />
        <span className="text-sm text-gray-600">Loading update history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p className="text-sm text-red-600">Failed to load update history: {error}</p>
      </div>
    );
  }

  if (!updates || updates.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-600 mb-1">No update history</p>
        <p className="text-xs text-gray-400">Updates will appear here as changes are made</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-600" />
        Update History ({updates.length})
      </h4>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {updates.map((update, index) => {
          const UpdateIcon = getUpdateIcon(update.updateType);
          const colorClass = getUpdateColor(update.updateType);
          const timestamp = new Date(update.createdAt).toLocaleString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={update._id || index}
              className={`bg-white border-2 rounded-xl p-4 transition-all hover:shadow-md ${colorClass.split(" ")[2]}`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorClass.split(" ").slice(1, 3).join(" ")}`}>
                  <UpdateIcon className={`w-5 h-5 ${colorClass.split(" ")[0]}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
                          {formatUpdateType(update.updateType)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{update.description}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                      {timestamp}
                    </span>
                  </div>

                  {/* Old/New Values */}
                  {(update.oldValue || update.newValue) && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {update.oldValue && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          From: {update.oldValue}
                        </span>
                      )}
                      {update.oldValue && update.newValue && (
                        <span className="text-gray-400">→</span>
                      )}
                      {update.newValue && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">
                          To: {update.newValue}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Changes Object */}
                  {update.changes && Object.keys(update.changes).length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      {Object.entries(update.changes).map(([key, value]) => (
                        <span key={key} className="inline-block mr-2 mb-1 px-2 py-0.5 bg-gray-100 rounded">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Updated By */}
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span>Updated by: {update.updatedByName || update.updatedBy?.name || "System"}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReservationUpdateHistory;

