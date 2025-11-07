import { useEffect } from "react";
import { Sun, TrendingUp, Calendar } from "lucide-react";
import { useSaleStore } from "../../store/saleStore";
import { formatPrice } from "../../utils/formatPrice";

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

  useEffect(() => {
    // Fetch all 4 when component mounts
    fetchDailySales();
    fetchAnnualSales();
    fetchMonthlySales();
  }, [fetchDailySales, fetchAnnualSales, fetchMonthlySales]);

  if (loading) return null;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Daily Sales */}
      <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow">
        <div>
          <p className="text-gray-500 text-sm font-medium">Today's Sales</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(dailySales || 0)}
          </p>
        </div>
        <div className="p-3 bg-green-100 rounded-full">
          <Sun className="w-6 h-6 text-green-600" />
        </div>
      </div>

      {/* Monthly Sales */}
      <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow">
        <div>
          <p className="text-gray-500 text-sm font-medium">
            This Month's Sales
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(monthlySales || 0)}
          </p>
        </div>
        <div className="p-3 bg-orange-100 rounded-full">
          <Calendar className="w-6 h-6 text-orange-600" />
        </div>
      </div>

      {/* Annual Sales */}
      <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow">
        <div>
          <p className="text-gray-500 text-sm font-medium">Annual Sales</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(annualSales || 0)}
          </p>
        </div>
        <div className="p-3 bg-purple-100 rounded-full">
          <Calendar className="w-6 h-6 text-purple-600" />
        </div>
      </div>
    </div>
  );
}

export default SaleCards;
