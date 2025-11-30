export const formatVariantLabel = (variant) => {
  if (!variant) return "";

  const size = variant.size ? String(variant.size).trim() : "";
  const unit = variant.unit ? String(variant.unit).trim() : "";
  const dimension = variant.dimension ? String(variant.dimension).trim() : "";
  const dimensionType = variant.dimensionType ? String(variant.dimensionType).trim() : "";
  const includePer = Boolean(variant.includePerText);

  // Priority 1: If size and unit exist, display as: "size unit" or "size per unit"
  // Example: "12 ft" or "1 per 30 m"
  // Size should always appear on the left side of unit
  if (size && unit) {
    return includePer ? `${size} per ${unit}` : `${size} ${unit}`;
  }

  // Priority 2: If dimension and unit exist (but no size), display as: "Unit (dimension dimensionType)" or "Unit (dimension)"
  // Example: "Set (1 inch diameter)" or "Set (1 inch)"
  if (dimension && unit) {
    const dimLabel = dimensionType ? `${dimension} ${dimensionType}` : dimension;
    return `${unit.charAt(0).toUpperCase() + unit.slice(1)} (${dimLabel})`;
  }

  // Priority 3: If only dimension exists without unit
  if (dimension) {
    return dimensionType ? `${dimension} ${dimensionType}` : dimension;
  }

  // Fallback: return size or unit if available
  return size || unit || "";
};

