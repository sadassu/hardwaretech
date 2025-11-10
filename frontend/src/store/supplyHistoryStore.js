import { create } from "zustand";
import api from "../utils/api";

export const useSupplyHistoryStore = create((set, get) => ({
  supplyHistories: [],
  pages: 1,
  total: 0,
  loading: false,
  error: null,

  setSupplyHistories: (data) => set({ supplyHistories: data }),
  setPages: (pages) => set({ pages }),
  setTotal: (total) => set({ total }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchSupplyHistories: async ({
    token,
    page = 1,
    limit = 10,
    search = "",
    startDate,
    endDate,
  }) => {
    set({ loading: true, error: null });

    try {
      const params = { page, limit, search };

      // ✅ Add startDate and endDate if provided
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get("/supply-histories", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;

      set({
        supplyHistories: data.histories || [],
        pages: data.pages || 1,
        total: data.total || 0,
        loading: false,
      });
    } catch (err) {
      console.error("Fetch supply histories failed:", err);
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch supply histories",
        loading: false,
      });
    }
  },

  redoSupplyHistory: async ({ id, token, additionalNotes = "" }) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post(
        `/supply-histories/${id}/redo`,
        { additionalNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await get().fetchSupplyHistories({ token });
      set({ loading: false });
      return res.data;
    } catch (err) {
      console.error("Redo supply history failed:", err);
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to redo supply history",
        loading: false,
      });
      throw err;
    }
  },

  fetchMoneySpentSevenDays: async (token) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/supply-histories/money-spent-seven-days", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data.data; // This is your daily spending array
    } catch (err) {
      console.error("Fetch money spent (7 days) failed:", err);
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch 7-day spending data",
        loading: false,
      });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchItemsStockedSevenDays: async (token) => {
    try {
      const res = await api.get("/supply-histories/items-stocked-seven-days", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data; // array of last 7 days [{ date, totalItems }]
    } catch (err) {
      console.error("Fetch items stocked 7 days failed:", err);
      throw err;
    }
  },

  fetchTotalMoneySpent: async (token) => {
    try {
      const res = await api.get("/supply-histories/total-money-spent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.total; // number
    } catch (err) {
      console.error("Fetch total money spent failed:", err);
      throw err;
    }
  },
}));
