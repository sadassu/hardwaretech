import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../utils/api";

export const useSaleStore = create(
  persist(
    (set) => ({
      dailySales: 0,
      annualSales: 0,
      monthlySales: 0,
      loading: false,
      error: null,

      // ✅ Fetch daily sales
      fetchDailySales: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.get("/sales/daily-sales");
          set({ dailySales: res.data.totalSales || 0, loading: false });
        } catch (error) {
          console.error("Failed to fetch daily sales:", error);
          set({
            error:
              error.response?.data?.message || "Failed to fetch daily sales",
            loading: false,
          });
        }
      },

      // ✅ Fetch annual sales
      fetchAnnualSales: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.get("/sales/annual-sales");
          set({ annualSales: res.data.totalAnnualSales || 0, loading: false });
        } catch (error) {
          console.error("Failed to fetch annual sales:", error);
          set({
            error:
              error.response?.data?.message || "Failed to fetch annual sales",
            loading: false,
          });
        }
      },

      fetchThisYearSales: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.get("/sales/this-year-sales");
          set({ thisYearSales: res.data.totalSales || 0, loading: false });
        } catch (error) {
          console.error("Failed to fetch this year's sales:", error);
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch this year's sales",
            loading: false,
          });
        }
      },

      fetchMonthlySales: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.get("/sales/monthly-sales");
          set({ monthlySales: res.data.totalMonthlySales || 0, loading: false });
        } catch (error) {
          console.error("Failed to fetch monthly sales:", error);
          set({
            error:
              error.response?.data?.message || "Failed to fetch monthly sales",
            loading: false,
          });
        }
      },
    }),
    {
      name: "sales-storage",
    }
  )
);
