import { create } from "zustand";
import api from "../utils/api"; // your axios instance

export const useCategoriesStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  // ✅ Fetch all categories
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/categories");
      set({ categories: res.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  // 🗑️ Delete a category
  deleteCategory: async (id) => {
    const { categories } = get(); // get current state
    set({ loading: true, error: null });
    try {
      await api.delete(`/categories/${id}`); // DELETE request to backend

      // Update local store instantly (optimistic update)
      const updated = categories.filter((cat) => cat._id !== id);
      set({ categories: updated, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  // ➕ Add a category
  addCategory: async ({ name, description }) => {
    const { categories } = get();
    set({ loading: true, error: null });

    try {
      const res = await api.post(`/categories`, { name, description });
      set({
        categories: [...categories, res.data.category],
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },
}));
