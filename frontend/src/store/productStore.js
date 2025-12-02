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

          // When searching, prioritize matches on product name over other fields
          let sortedProducts = products;
          if (search && Array.isArray(products)) {
            const term = search.toLowerCase().trim();

            const getNameScore = (product) => {
              const name = (product?.name || "").toLowerCase();
              if (!name || !term) return 0;
              if (name === term) return 3; // exact match
              if (name.startsWith(term)) return 2; // prefix match
              if (name.includes(term)) return 1; // substring match
              return 0;
            };

            sortedProducts = [...products].sort((a, b) => {
              const scoreA = getNameScore(a);
              const scoreB = getNameScore(b);
              if (scoreA !== scoreB) {
                // Higher score first
                return scoreB - scoreA;
              }
              // Fallback to existing name sort (already asc from backend)
              return 0;
            });
          }

          set({
            products: enhanceProducts(sortedProducts),
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
          
          // ✅ Preserve existing variants from the store when updating
          // The backend doesn't return variants, so we need to keep the existing ones
          const existingProduct = products.find((p) => p._id === productId);
          const productWithVariants = {
            ...updatedProduct,
            variants: existingProduct?.variants || updatedProduct.variants || [],
          };

          const updatedProducts = products.map((p) =>
            p._id === productId ? productWithVariants : p
          );

          set({
            products: enhanceProducts(updatedProducts),
            loading: false,
          });
          
          // Dispatch event to notify cart and other components
          setTimeout(() => {
            window.dispatchEvent(new Event("productUpdated"));
          }, 0);
          
          return productWithVariants;
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
