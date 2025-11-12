import { useFetch } from "../../hooks/useFetch";

/**
 * Sub-component to show stock details in Modal
 */
export function StockList({ type }) {
  const { data, loading, error } = useFetch(
    `dashboard/stocks?type=${type}&page=1&limit=999`,
    {},
    [type]
  );

  return (
    <div className="p-4 text-gray-100 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 capitalize text-white">
        {type} Stock
      </h2>

      {loading && <p className="text-gray-400">Loading {type} stocks...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {data?.items?.length > 0 ? (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {data.items.map((variant) => (
            <div
              key={variant._id}
              className="flex items-start gap-4 border-b border-gray-700 pb-3"
            >
              <img
                src={variant.product?.image || "/placeholder.png"}
                alt={variant.product?.name}
                className="w-12 h-12 object-cover rounded-md border border-gray-600"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-white">
                  {variant.product?.name || "Unnamed Product"}
                </h3>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-300 mt-1">
                  <p>
                    <strong className="text-gray-400">Unit:</strong>{" "}
                    {variant.unit}
                  </p>
                  <p>
                    <strong className="text-gray-400">Size:</strong>{" "}
                    {variant.size || "—"}
                  </p>
                  <p>
                    <strong className="text-gray-400">Color:</strong>{" "}
                    {variant.color || "—"}
                  </p>

                  <p>
                    <strong className="text-gray-400">Quantity:</strong>{" "}
                    <span
                      className={`${
                        variant.quantity === 0
                          ? "text-red-400 font-semibold"
                          : variant.quantity <= 15
                          ? "text-yellow-400 font-semibold"
                          : "text-green-400"
                      }`}
                    >
                      {variant.quantity}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className="text-gray-500">No {type} stocks found.</p>
      )}
    </div>
  );
}
