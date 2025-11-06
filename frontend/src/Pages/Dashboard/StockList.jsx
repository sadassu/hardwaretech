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
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 capitalize">{type} Stock</h2>

      {loading && <p>Loading {type} stocks...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {data?.items?.length > 0 ? (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {data.items.map((variant) => (
            <div
              key={variant._id}
              className="flex items-start gap-4 border-b pb-2"
            >
              <img
                src={variant.product?.image || "/placeholder.png"}
                alt={variant.product?.name}
                className="w-12 h-12 object-cover rounded-md"
              />
              <div>
                <h3 className="font-semibold">{variant.product?.name}</h3>
                <p className="text-sm text-gray-500">Qty: {variant.quantity}</p>
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
