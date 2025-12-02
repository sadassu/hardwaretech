import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    unit: {
      type: String,
      enum: [
        "pcs",
        "kg",
        "g",
        "lb",
        "m",
        "cm",
        "ft",
        "set",
        "W",
        "V",
        "amphere",
        "gang",
        "box",
        "pack",
        "roll",
        "Wey",
      ],
      required: true,
    },
    size: { type: String },
    color: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    supplier_price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    // Per-variant low stock threshold so admins can control when an item is considered "low"
    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 15,
    },
    includePerText: {
      type: Boolean,
      default: false,
    },
    dimension: {
      type: String,
      trim: true,
    },
    dimensionType: {
      type: String,
      enum: ["diameter", "thickness", "length", "width", "height", null],
      default: null,
    },
    conversionSource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      default: null,
    },
    conversionQuantity: {
      type: Number,
      min: 1,
      default: 1,
    },
    autoConvert: {
      type: Boolean,
      default: false,
    },
    conversionNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Note: Supply histories are NOT deleted when a variant is deleted
// This preserves historical financial data (money spent calculations)
// even if products/variants are removed from the system

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);
export default ProductVariant;
