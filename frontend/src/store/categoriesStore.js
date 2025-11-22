import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../utils/api"; // your axios instance

export const useCategoriesStore = create(
  persist(
    (set, get) => ({
      categories: [],
      loading: false,
      error: null,

      // ✅ Fetch all categories
      fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.get("/categories");
          const categories = Array.isArray(res.data)
            ? res.data
            : res.data.categories;
          set({ categories, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || err.message,
            loading: false,
          });
        }
      },

      // 🗑️ Delete a category
      deleteCategory: async (id) => {
        const { categories } = get();
        set({ loading: true, error: null });
        try {
          await api.delete(`/categories/${id}`);
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
      addCategory: async ({ name }) => {
        const { categories } = get();
        set({ loading: true, error: null });

        try {
          const res = await api.post(`/categories`, { name });
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
    }),
    {
      name: "categories-store", 
      partialize: (state) => ({
        categories: state.categories,
      }),
    }
  )
);
