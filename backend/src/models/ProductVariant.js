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
      enum: ["pcs", "kg", "g", "lb", "m", "cm", "ft", "set"],
      required: true,
    },
    size: { type: String },
    color: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    supplier_price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);

export default ProductVariant;
