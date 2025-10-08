import React, { useEffect } from "react";
import { useSupplyHistoryStore } from "../../store/supplyHistoryStore";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Loader2, Package, Calendar, Tag, Boxes } from "lucide-react";

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
      <div className="flex justify-center items-center py-6">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        <span>Loading supply histories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error flex items-center gap-3">
        <span>Error: {error}</span>
      </div>
    );
  }

  if (supplyHistories.length === 0) {
    return (
      <div className="text-center text-base-content/60 py-6">
        No supply history found.
      </div>
    );
  }

  const last10 = supplyHistories.slice(0, 10);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p>Last 10 Supply History</p>
      <div className="grid gap-4">
        {last10.map((h) => (
          <div
            key={h._id}
            className="card bg-base-100 border border-base-200 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <h2 className="card-title text-lg font-semibold truncate">
                  {h.product_variant?.product?.name || "Unknown Product"}
                </h2>
                <Tag className="w-5 h-5 text-primary" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-base-content/70" />
                  <span className="text-base-content/80">
                    Variant:{" "}
                    {h.product_variant?.size
                      ? `${h.product_variant.size} ${
                          h.product_variant.unit || ""
                        }`
                      : h.product_variant?.unit || ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-base-content/70" />
                  <span className="text-base-content/80">
                    Quantity: {h.quantity} pcs
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-base-content/70" />
                  <span className="text-base-content/80">
                    Supplied on:{" "}
                    {new Date(h.supplied_at).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-base-200 flex justify-between items-center">
                <span className="text-sm text-base-content/70">
                  Total Cost:
                </span>
                <span className="text-lg font-semibold text-primary">
                  ₱
                  {h.total_cost?.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
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
