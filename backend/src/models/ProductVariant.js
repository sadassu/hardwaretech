import mongoose from "mongoose";
import SupplyHistory from "./SupplyHistory.js";

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
        "ampere",
        "gang",
      ],
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

// 🧹 Cascade delete supply histories when a variant is deleted
productVariantSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await SupplyHistory.deleteMany({ product_variant: doc._id });
  }
});

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);
export default ProductVariant;
