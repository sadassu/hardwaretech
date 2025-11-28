import mongoose from "mongoose";

const inventoryLossSchema = new mongoose.Schema(
  {
    product_variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    supply_history: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupplyHistory",
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      enum: ["pullout", "manual_adjustment"],
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const InventoryLoss = mongoose.model("InventoryLoss", inventoryLossSchema);

export default InventoryLoss;

