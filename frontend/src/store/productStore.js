import { create } from "zustand";
import api from "../utils/api";
import { persist } from "zustand/middleware";

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      total: 0,
      page: 1,
      pages: 1,
      loading: false,
      error: null,

      // ✅ Set products (used after fetching)
      setProducts: ({ products, total, page, pages }) =>
        set({ products, total, page, pages }),

      // ✅ Fetch products
      fetchProducts: async (
        token,
        { page = 1, limit = 10, search = "", category = "" } = {}
      ) => {
        set({ loading: true, error: null });
        try {
          const res = await api.get("/products", {
            params: {
              page,
              limit,
              sortBy: "name",
              sortOrder: "asc",
              search,
              category,
              includeCategories: "true",
            },
            headers: { Authorization: `Bearer ${token}` },
          });

          const { products, total, pages } = res.data;
          set({ products, total, page, pages, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch products",
            loading: false,
          });
        }
      },

      // 🗑️ Delete product by ID
      deleteProduct: async (token, productId) => {
        const { products } = get();
        set({ loading: true, error: null });

        try {
          await api.delete(`/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Optimistic update
          const updated = products.filter((p) => p._id !== productId);
          set({ products: updated, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to delete product",
            loading: false,
          });
          throw err;
        }
      },

      // ✏️ Update product by ID
      updateProduct: async (token, productId, payload) => {
        const { products } = get();
        set({ loading: true, error: null });

        try {
          const res = await api.put(`/products/${productId}`, payload, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const updatedProduct = res.data.product;
          const updatedProducts = products.map((p) =>
            p._id === productId ? updatedProduct : p
          );

          set({ products: updatedProducts, loading: false });
          return updatedProduct;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to update product",
            loading: false,
          });
          throw err;
        }
      },
    }),
    {
      name: "product-storage",
    }
  )
);
