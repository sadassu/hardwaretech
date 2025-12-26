import React, { useEffect } from "react";
import { useSupplyHistoryStore } from "../../store/supplyHistoryStore";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Loader2, Package, Calendar, Boxes } from "lucide-react";
import { formatVariantLabel } from "../../utils/formatVariantLabel";

function SupplyHistoryCard() {
  const { user } = useAuthContext();
  const { supplyHistories, fetchSupplyHistories, loading, error } =
    useSupplyHistoryStore();

  useEffect(() => {
    if (user?.token) {
      fetchSupplyHistories({ token: user.token, limit: 10, page: 1 });
    }
  }, [user?.token, fetchSupplyHistories]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin w-5 h-5 mr-2 text-gray-400" />
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <span className="text-sm text-red-600">Error: {error}</span>
      </div>
    );
  }

  if (supplyHistories.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-8">
        No supply history found.
      </div>
    );
  }

  const last10 = supplyHistories.slice(0, 10);

  return (
    <div className="space-y-3">
      <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
        Recent Supply History
      </h3>
      <div className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto pr-1">
        {last10.map((h) => (
          <div
            key={h._id}
            className="p-2.5 sm:p-3 border bg-base-200 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-1.5 sm:mb-2">
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1 flex-1">
                {h.product_variant?.product?.name || h.productName || "Unknown Product"}
              </h4>
              <span className="text-xs font-semibold text-gray-900 ml-2 whitespace-nowrap">
                ₱
                {h.total_cost?.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {formatVariantLabel(h.product_variant) || 
                    (h.product_variant?.size || h.variantSize
                      ? `${h.product_variant?.size || h.variantSize} ${
                          h.product_variant?.unit || h.variantUnit || ""
                        }`
                      : h.product_variant?.unit || h.variantUnit || "N/A")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-gray-400" />
                <span>{h.quantity} pcs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {new Date(h.supplied_at).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SupplyHistoryCard;
