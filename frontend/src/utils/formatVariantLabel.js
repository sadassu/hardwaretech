export const formatVariantLabel = (variant) => {
  if (!variant) return "";

  const size = variant.size ? String(variant.size).trim() : "";
  const unit = variant.unit ? String(variant.unit).trim() : "";
  const dimension = variant.dimension ? String(variant.dimension).trim() : "";
  const dimensionType = variant.dimensionType ? String(variant.dimensionType).trim() : "";
  const includePer = Boolean(variant.includePerText);

  // If dimension exists, display as: "Unit (dimension dimensionType)" or "Unit (dimension)"
  // Example: "Set (1 inch diameter)" or "Set (1 inch)"
  if (dimension && unit) {
    const dimLabel = dimensionType ? `${dimension} ${dimensionType}` : dimension;
    return `${unit.charAt(0).toUpperCase() + unit.slice(1)} (${dimLabel})`;
  }

  // Original logic for size and unit
  if (size && unit) {
    return includePer ? `${size} per ${unit}` : `${size} ${unit}`;
  }

  // If only dimension exists without unit
  if (dimension) {
    return dimensionType ? `${dimension} ${dimensionType}` : dimension;
  }

  return size || unit || "";
};

