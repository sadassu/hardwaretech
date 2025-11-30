import { create } from "zustand";
import api from "../utils/api";
import { persist } from "zustand/middleware";

const mapVariantsWithAvailability = (variants = []) => {
  const variantMap = new Map(
    variants.map((variant) => [variant._id, variant])
  );

  return variants.map((variant) => {
    const baseQuantity = Number(variant.quantity) || 0;
    let convertibleQuantity = 0;

    if (variant.autoConvert && variant.conversionSource) {
      const source = variantMap.get(variant.conversionSource);
      if (source) {
        const sourceQty = Number(source.quantity) || 0;
        const multiplier = Number(variant.conversionQuantity) || 1;
        convertibleQuantity = sourceQty * multiplier;
      }
    }

    return {
      ...variant,
      availableQuantity: baseQuantity + convertibleQuantity,
      canAutoConvert: Boolean(variant.autoConvert && variant.conversionSource),
    };
  });
};

const enhanceProducts = (products = []) =>
  products.map((product) => ({
    ...product,
    variants: mapVariantsWithAvailability(product.variants || []),
  }));

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      total: 0,
      page: 1,
      pages: 1,
      loading: false,
      error: null,
      successMessage: null, // ✅ Added success message state

      // ✅ Set products (used after fetching)
      setProducts: ({ products, total, page, pages }) =>
        set({
          products: enhanceProducts(products),
          total,
          page,
          pages,
        }),

      // ✅ Set success message (used by CreateProduct)
      setSuccess: (message) => set({ successMessage: message }),

      // ✅ Clear both success & error messages
      clearMessages: () => set({ successMessage: null, error: null }),

      // ✅ Fetch products
      fetchProducts: async (
        token,
        { page = 1, limit = 12, search = "", category = "" } = {}
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
          set({
            products: enhanceProducts(products),
            total,
            page,
            pages,
            loading: false,
          });
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
          
          // Dispatch event to notify cart and other components
          setTimeout(() => {
            window.dispatchEvent(new Event("productUpdated"));
          }, 0);
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

          set({
            products: enhanceProducts(updatedProducts),
            loading: false,
          });
          
          // Dispatch event to notify cart and other components
          setTimeout(() => {
            window.dispatchEvent(new Event("productUpdated"));
          }, 0);
          
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
