import { useEffect } from "react";
import { Sun, TrendingUp, Calendar } from "lucide-react";
import { useSaleStore } from "../../store/saleStore";
import { formatPrice } from "../../utils/formatPrice";
import { useLiveResourceRefresh } from "../../hooks/useLiveResourceRefresh";

function SaleCards() {
  const {
    dailySales,
    annualSales,
    monthlySales,
    fetchDailySales,
    fetchAnnualSales,
    fetchMonthlySales,
    loading,
    error,
  } = useSaleStore();
  const salesLiveKey = useLiveResourceRefresh(["sales"]);

  useEffect(() => {
    // Fetch all 4 when component mounts or when sales change
    fetchDailySales();
    fetchAnnualSales();
    fetchMonthlySales();
  }, [fetchDailySales, fetchAnnualSales, fetchMonthlySales, salesLiveKey]);

  if (loading) return null;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
      {/* Daily Sales */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div>
          <p className="text-gray-500 text-xs font-medium">Today's Sales</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {formatPrice(dailySales || 0)}
          </p>
        </div>
        <div className="p-2 bg-green-100 rounded-full">
          <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
        </div>
      </div>

      {/* Monthly Sales */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div>
          <p className="text-gray-500 text-xs font-medium">
            This Month's Sales
          </p>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {formatPrice(monthlySales || 0)}
          </p>
        </div>
        <div className="p-2 bg-orange-100 rounded-full">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
        </div>
      </div>

      {/* Annual Sales */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div>
          <p className="text-gray-500 text-xs font-medium">Annual Sales</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {formatPrice(annualSales || 0)}
          </p>
        </div>
        <div className="p-2 bg-purple-100 rounded-full">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
        </div>
      </div>
    </div>
  );
}

export default SaleCards;
