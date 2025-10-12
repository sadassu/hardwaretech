import { useAuthContext } from "./useAuthContext";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";
import { useProductStore } from "../store/productStore";

export const useVariant = () => {
  const { user } = useAuthContext();
  const { products, setProducts } = useProductStore();
  const setToast = useToast();

  // ✅ Helper to update a product's variants inside the store
  const updateProductVariants = (productId, updatedVariant, action) => {
    const updatedProducts = products.map((product) => {
      if (product._id !== productId) return product;

      const existingVariants = product.variants || [];

      switch (action) {
        case "add":
          return {
            ...product,
            variants: [...existingVariants, updatedVariant],
          };
        case "update":
          return {
            ...product,
            variants: existingVariants.map((v) =>
              v._id === updatedVariant._id ? updatedVariant : v
            ),
          };
        case "delete":
          return {
            ...product,
            variants: existingVariants.filter(
              (v) => v._id !== updatedVariant._id
            ),
          };
        default:
          return product;
      }
    });

    setProducts({
      products: updatedProducts,
      total: products.length,
      page: 1,
      pages: 1,
    });
  };

  // ✅ Create Variant
  const createVariant = async (productId, formData, hasColor) => {
    try {
      const res = await api.post(
        "/product-variants",
        {
          productId,
          ...formData,
          color: hasColor ? formData.color : null,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      updateProductVariants(productId, res.data.variant, "add");

      setToast({
        show: true,
        color: "success-toast",
        header: "Success",
        message: res.data.message || "Variant created successfully!",
      });

      return res.data;
    } catch (error) {
      setToast({
        show: true,
        color: "error-toast",
        header: "Error",
        message:
          error.response?.data?.message || "Failed to create product variant",
      });
      throw error;
    }
  };

  // ✅ Update Variant
  const updateVariant = async (variantId, formData) => {
    try {
      const res = await api.put(`/product-variants/${variantId}`, formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      updateProductVariants(res.data.productId, res.data.variant, "update");

      setToast({
        show: true,
        color: "success-toast",
        header: "Updated",
        message: res.data.message || "Variant updated successfully!",
      });

      return res.data;
    } catch (error) {
      setToast({
        show: true,
        color: "error-toast",
        header: "Error",
        message:
          error.response?.data?.message || "Failed to update product variant",
      });
      throw error;
    }
  };

  // ✅ Delete Variant
  const deleteVariant = async (variantId) => {
    try {
      const res = await api.delete(`/product-variants/${variantId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      updateProductVariants(
        res.data.productId,
        { _id: res.data.variantId },
        "delete"
      );

      setToast({
        show: true,
        color: "error-toast",
        header: "Deleted",
        message: res.data.message || "Variant deleted successfully!",
      });

      return res.data;
    } catch (error) {
      setToast({
        show: true,
        color: "error-toast",
        header: "Error",
        message:
          error.response?.data?.message || "Failed to delete product variant",
      });
      throw error;
    }
  };

  // ✅ Restock Variant
  const restockVariant = async (variantId, formData) => {
    try {
      const res = await api.post(
        `/product-variants/${variantId}/restock`,
        formData,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      updateProductVariants(res.data.productId, res.data.variant, "update");

      setToast({
        show: true,
        color: "success-toast",
        header: "Restocked",
        message: res.data.message || "Variant restocked successfully!",
      });

      return res.data;
    } catch (error) {
      setToast({
        show: true,
        color: "error-toast",
        header: "Error",
        message:
          error.response?.data?.message || "Failed to restock product variant",
      });
      throw error;
    }
  };

  return { createVariant, updateVariant, deleteVariant, restockVariant };
};
