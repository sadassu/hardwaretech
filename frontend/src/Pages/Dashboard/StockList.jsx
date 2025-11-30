import { useFetch } from "../../hooks/useFetch";
import { Package, AlertTriangle, XCircle, Search, ImageOff } from "lucide-react";
import { useState } from "react";
import { formatVariantLabel } from "../../utils/formatVariantLabel";
import { useLiveResourceRefresh } from "../../hooks/useLiveResourceRefresh";

/**
 * Sub-component to show stock details in Modal
 */
export function StockList({ type }) {
  const [searchTerm, setSearchTerm] = useState("");
  const inventoryLiveKey = useLiveResourceRefresh(["inventory", "supply"]);
  
  const { data, loading, error } = useFetch(
    `dashboard/stocks?type=${type}&page=1&limit=999`,
    {},
    [type, inventoryLiveKey]
  );

  // Filter items based on search
  const filteredItems = data?.items?.filter(item =>
    item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.size?.toString().includes(searchTerm)
  ) || [];

  const typeConfig = {
    all: { icon: Package, color: 'blue', title: 'All Stock Items', badge: 'bg-blue-100 text-blue-700' },
    low: { icon: AlertTriangle, color: 'amber', title: 'Low Stock Items', badge: 'bg-amber-100 text-amber-700' },
    out: { icon: XCircle, color: 'red', title: 'Out of Stock Items', badge: 'bg-red-100 text-red-700' },
  };

  const config = typeConfig[type] || typeConfig.all;
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 sm:p-3 rounded-xl bg-${config.color}-100`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${config.color}-600`} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {config.title}
      </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              {data?.total || 0} {data?.total === 1 ? 'variant' : 'variants'} found
            </p>
          </div>
        </div>

        {/* Search Bar */}
        {data?.items?.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, color, or size..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading {type} stocks...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredItems.map((variant) => (
            <div
              key={variant._id}
                className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-3 sm:p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
                <div className="flex gap-3">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {variant.product?.image ? (
              <img
                        src={variant.product.image}
                alt={variant.product?.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg border-2 border-gray-200 ${variant.product?.image ? 'hidden' : 'flex'} items-center justify-center`}>
                      <ImageOff className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate mb-2">
                  {variant.product?.name || "Unnamed Product"}
                </h3>

                    <div className="space-y-1.5">
                      {/* Variant Details */}
                      <div className="flex flex-wrap gap-1.5">
                        {(variant.size || variant.dimension || variant.unit) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {formatVariantLabel(variant) || `${variant.size || ""} ${variant.unit || ""}`.trim()}
                          </span>
                        )}
                        {variant.color && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold capitalize border border-gray-300"
                            style={{ color: variant.color }}
                          >
                            <span
                              className="inline-block w-3 h-3 rounded-full border border-gray-300"
                              style={{ backgroundColor: variant.color }}
                            ></span>
                            {variant.color}
                          </span>
                        )}
                      </div>

                      {/* Quantity Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">Quantity:</span>
                    <span
                          className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold ${
                        variant.quantity === 0
                              ? "bg-red-100 text-red-700"
                          : variant.quantity <= 50
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                      }`}
                    >
                      {variant.quantity}
                          {variant.quantity === 0 && " - Out"}
                          {variant.quantity > 0 && variant.quantity <= 50 && " - Low"}
                    </span>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
          !loading && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">
                {searchTerm ? 'No items match your search' : `No ${type} stocks found`}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear search
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
