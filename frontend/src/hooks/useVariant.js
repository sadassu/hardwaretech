import { useAuthContext } from "./useAuthContext";
import { useProductsContext } from "./useProductContext";
import api from "../utils/api";
import { toast } from "react-hot-toast";

export const useVariant = () => {
  const { user } = useAuthContext();
  const { dispatch } = useProductsContext();

  // Create Variant
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

      dispatch({
        type: "UPDATE_VARIANT",
        payload: {
          productId: res.data.productId,
          variant: res.data.variant,
        },
      });

      toast.success(res.data.message || "Variant created!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create variant");
      throw error;
    }
  };

  // Delete Variant
  const deleteVariant = async (variantId) => {
    try {
      const res = await api.delete(`/product-variants/${variantId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      dispatch({
        type: "DELETE_VARIANT",
        payload: {
          productId: res.data.productId,
          variantId: res.data.variantId,
        },
      });

      toast.success(res.data.message || "Variant deleted!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete variant");
      throw error;
    }
  };

  const updateVariant = async (variantId, formData) => {
    try {
      const res = await api.put(`/product-variants/${variantId}`, formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      dispatch({
        type: "UPDATE_VARIANT",
        payload: {
          productId: res.data.productId,
          variant: res.data.variant,
        },
      });

      toast.success(res.data.message || "Variant updated!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update variant");
      throw error;
    }
  };

  return { createVariant, deleteVariant, updateVariant };
};
