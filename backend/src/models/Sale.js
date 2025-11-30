// models/Sale.js
import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  productVariantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductVariant",
    required: true,
  },
  productName: { type: String }, // Store product name for persistence
  categoryName: { type: String }, // Store category name for persistence
  size: { type: String },
  unit: { type: String },
  color: { type: String }, // Store color for persistence
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  subtotal: { type: Number },
});

const saleSchema = new mongoose.Schema(
  {
    items: [saleItemSchema],

    totalPrice: {
      type: Number,
      required: true,
    },

    amountPaid: {
      type: Number,
      required: true,
    },

    change: {
      type: Number,
      required: true,
    },

    saleDate: {
      type: Date,
      default: Date.now,
    },

    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    type: {
      type: String,
      enum: ["pos", "reservation"],
      required: true,
    },
  },
  { timestamps: true }
);

saleSchema.pre("validate", function (next) {
  this.items.forEach((item) => {
    item.subtotal = item.price * item.quantity;
  });

  this.totalPrice = this.items.reduce((acc, item) => acc + item.subtotal, 0);
  this.change = this.amountPaid - this.totalPrice;

  next();
});

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;
