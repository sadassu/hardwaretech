import mongoose from "mongoose";

const supplyHistorySchema = new mongoose.Schema(
  {
    product_variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    supplier_price: { type: Number, required: true, min: 0 },
    total_cost: { type: Number, required: true, min: 0 }, 
    supplied_at: { type: Date, default: Date.now },
    notes: { type: String }, 
  },
  { timestamps: true }
);

const SupplyHistory = mongoose.model("SupplyHistory", supplyHistorySchema);

export default SupplyHistory; 
