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
  }) => {
    set({ loading: true, error: null });

    try {
      const res = await api.get("/supply-histories", {
        params: { page, limit, search },
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

  // 💰 Total money spent in the last 7 days
  getLast7DaysSpending: () => {
    const { supplyHistories } = get();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return supplyHistories
      .filter((h) => new Date(h.supplied_at) >= sevenDaysAgo)
      .reduce((sum, h) => sum + (h.total_cost || 0), 0);
  },

  // 📦 Total supply history count in the last 7 days
  getLast7DaysItems: () => {
    const { supplyHistories } = get();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // just count entries instead of summing quantities
    return supplyHistories.filter(
      (h) => new Date(h.supplied_at) >= sevenDaysAgo
    ).length;
  },

  // 🧮 Overall total money spent (all time)
  getTotalMoneySpent: () => {
    const { supplyHistories } = get();
    return supplyHistories.reduce((sum, h) => sum + (h.total_cost || 0), 0);
  },

  // 🧾 Overall count of all supply histories (all time)
  getTotalItemsStocked: () => {
    const { supplyHistories } = get();
    return supplyHistories.length;
  },
}));
