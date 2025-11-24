import ProductVariant from "../models/ProductVariant.js";

export const validateConversionRequest = async ({
  productId,
  conversionSourceId,
  variantId = null,
}) => {
  if (!conversionSourceId) return null;

  const source = await ProductVariant.findById(conversionSourceId).lean();
  if (!source) {
    throw new Error("Conversion source variant not found");
  }

  if (String(source.product) !== String(productId)) {
    throw new Error("Conversion source must belong to the same product");
  }

  if (variantId) {
    await assertNoConversionCycle({
      startVariantId: variantId,
      nextSourceId: conversionSourceId,
    });
  }

  return source;
};

const assertNoConversionCycle = async ({ startVariantId, nextSourceId }) => {
  let currentId = nextSourceId;
  const visited = new Set();

  while (currentId) {
    if (String(currentId) === String(startVariantId)) {
      throw new Error("Conversion chain cannot reference itself");
    }

    if (visited.has(String(currentId))) {
      break;
    }
    visited.add(String(currentId));

    const doc = await ProductVariant.findById(currentId)
      .select("conversionSource")
      .lean();
    if (!doc) break;
    currentId = doc.conversionSource;
  }
};

export const ensureVariantStock = async ({
  variant,
  requiredQuantity,
  session,
  visited = new Set(),
}) => {
  if (!variant) {
    throw new Error("Variant not found");
  }

  if (
    !variant.autoConvert ||
    !variant.conversionSource ||
    requiredQuantity <= 0 ||
    variant.quantity >= requiredQuantity
  ) {
    return variant;
  }

  const variantId = String(variant._id);
  if (visited.has(variantId)) {
    throw new Error("Circular conversion detected");
  }
  visited.add(variantId);

  const conversionQty = Math.max(1, variant.conversionQuantity || 1);
  const shortage = Math.max(0, requiredQuantity - variant.quantity);
  const sourceUnitsNeeded = Math.ceil(shortage / conversionQty);
  if (sourceUnitsNeeded <= 0) {
    visited.delete(variantId);
    return variant;
  }

  const source = await ProductVariant.findById(variant.conversionSource).session(
    session
  );

  if (!source) {
    visited.delete(variantId);
    return variant;
  }

  // 🔁 Ensure the source has enough units (it may convert from its own source)
  await ensureVariantStock({
    variant: source,
    requiredQuantity: sourceUnitsNeeded,
    session,
    visited,
  });

  let converted = 0;
  while (
    variant.quantity < requiredQuantity &&
    source.quantity > 0 &&
    converted < sourceUnitsNeeded
  ) {
    source.quantity -= 1;
    variant.quantity += conversionQty;
    converted += 1;
  }

  await source.save({ session });
  await variant.save({ session });

  visited.delete(variantId);
  return variant;
};

