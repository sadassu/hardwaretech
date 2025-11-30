// models/Reservation.js
import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  // Store user name and email for persistence (even if user account is deleted)
  userName: { type: String },
  userEmail: { type: String },
  reservationDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "failed", "completed"],
    default: "pending",
  },
  notes: { type: String },
  remarks: { type: String, default: "no remarks" },
  totalPrice: { type: Number, required: true, min: 0 },
});

ReservationSchema.virtual("reservationDetails", {
  ref: "ReservationDetail",
  localField: "_id",
  foreignField: "reservationId",
});

// Make sure virtuals are included in JSON output
ReservationSchema.set("toObject", { virtuals: true });
ReservationSchema.set("toJSON", { virtuals: true });

ReservationSchema.pre("findOneAndDelete", async function (next) {
  const reservationId = this.getQuery()["_id"];
  await mongoose.model("ReservationDetail").deleteMany({ reservationId });
  next();
});

export default mongoose.model("Reservation", ReservationSchema);
