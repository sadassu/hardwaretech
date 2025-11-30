import { useAuthContext } from "./useAuthContext";
import api from "../utils/api";
import { useProductStore } from "../store/productStore";

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

export const useVariant = () => {
  const { user } = useAuthContext();
  const { products, setProducts } = useProductStore();

  // ✅ Helper to update a product's variants inside the store
    const updateProductVariants = (productId, updatedVariant, action) => {
    const updatedProducts = products.map((product) => {
      if (product._id !== productId) return product;

      const existingVariants = product.variants || [];

      switch (action) {
        case "add":
          return {
            ...product,
              variants: mapVariantsWithAvailability([
                ...existingVariants,
                updatedVariant,
              ]),
          };
        case "update":
          return {
            ...product,
              variants: mapVariantsWithAvailability(
                existingVariants.map((v) =>
                  v._id === updatedVariant._id ? updatedVariant : v
                )
              ),
          };
        case "delete":
          return {
            ...product,
              variants: mapVariantsWithAvailability(
                existingVariants.filter((v) => v._id !== updatedVariant._id)
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

    // Dispatch event to notify cart and other components
    setTimeout(() => {
      window.dispatchEvent(new Event("variantUpdated"));
    }, 0);
  };

  // ✅ Create Variant
  const createVariant = async (productId, formData) => {
    try {
      const payload = {
        productId,
        ...formData,
        conversionSource: formData.conversionSource || null,
        conversionQuantity: formData.conversionQuantity
          ? Number(formData.conversionQuantity)
          : undefined,
        autoConvert: formData.autoConvert,
      };

      if (!payload.autoConvert) {
        payload.conversionSource = null;
      }

      const res = await api.post("/product-variants", payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      updateProductVariants(productId, res.data.variant, "add");
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  // ✅ Update Variant
  const updateVariant = async (variantId, formData) => {
    try {
    const payload = {
      ...formData,
      conversionSource: formData.conversionSource || null,
      conversionQuantity: formData.conversionQuantity
        ? Number(formData.conversionQuantity)
        : undefined,
      autoConvert: formData.autoConvert,
    };

    if (!payload.autoConvert) {
      payload.conversionSource = null;
    }

    const res = await api.put(`/product-variants/${variantId}`, payload, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

      updateProductVariants(res.data.productId, res.data.variant, "update");
      return res.data;
    } catch (error) {
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

      return res.data;
    } catch (error) {
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
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  return { createVariant, updateVariant, deleteVariant, restockVariant };
};
