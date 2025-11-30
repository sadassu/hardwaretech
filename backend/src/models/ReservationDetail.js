// models/ReservationDetail.js
import mongoose from "mongoose";

const ReservationDetailSchema = new mongoose.Schema({
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    required: true,
  },
  productVariantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductVariant",
    required: true,
  },
  // Store product and variant details for persistence (even if product/variant is deleted)
  productName: { type: String },
  variantSize: { type: String },
  variantUnit: { type: String },
  variantColor: { type: String },
  quantity: { type: Number, required: true },
  size: { type: String },
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
    ],
    required: true,
  },
  price: { type: Number, default: 0, min: 0 },
  subtotal: { type: Number, default: 0, min: 0 },
});

export default mongoose.model("ReservationDetail", ReservationDetailSchema);
