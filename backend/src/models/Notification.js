// models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
      index: true,
    },
    reservationUpdateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReservationUpdate",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "status_changed",
        "details_updated",
        "remarks_updated",
        "cancelled",
        "completed",
        "total_price_changed",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    // Store snapshot of reservation data at time of notification
    reservationData: {
      status: String,
      totalPrice: Number,
      remarks: String,
      reservationDetails: [
        {
          productName: String,
          variantLabel: String,
          quantity: Number,
          price: Number,
          subtotal: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ reservationId: 1 });

// Virtual for formatted notification
NotificationSchema.virtual("formattedNotification").get(function () {
  return {
    id: this._id,
    reservationId: this.reservationId,
    type: this.type,
    message: this.message,
    read: this.read,
    readAt: this.readAt,
    date: this.createdAt,
    reservationData: this.reservationData,
  };
});

NotificationSchema.set("toObject", { virtuals: true });
NotificationSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Notification", NotificationSchema);

