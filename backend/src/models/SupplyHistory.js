import mongoose from "mongoose";

const supplyHistorySchema = new mongoose.Schema(
  {
    product_variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    // Store product name and variant details directly to preserve them even if product/variant is deleted
    productName: { type: String },
    variantSize: { type: String },
    variantUnit: { type: String },
    variantColor: { type: String },
    quantity: { type: Number, required: true, min: 0 },
    supplier_price: { type: Number, required: true, min: 0 },
    total_cost: { type: Number, required: true, min: 0 }, 
    supplied_at: { type: Date, default: Date.now },
    notes: { type: String }, 
    pulledOutQuantity: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const SupplyHistory = mongoose.model("SupplyHistory", supplyHistorySchema);

export default SupplyHistory; 
