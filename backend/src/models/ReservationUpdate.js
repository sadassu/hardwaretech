// models/ReservationUpdate.js
import mongoose from "mongoose";

const ReservationUpdateSchema = new mongoose.Schema(
  {
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
      index: true, // Index for faster queries
    },
    updateType: {
      type: String,
      enum: [
        "created",
        "status_changed",
        "details_updated",
        "remarks_updated",
        "cancelled",
        "completed",
        "total_price_changed",
      ],
      required: true,
    },
    // User who made the update (can be admin/cashier or the user themselves)
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Store user info for persistence (even if user account is deleted)
    updatedByName: { type: String },
    updatedByEmail: { type: String },
    // Old and new values for status changes
    oldValue: { type: String }, // e.g., old status
    newValue: { type: String }, // e.g., new status
    // Human-readable description of the update
    description: { type: String, required: true },
    // Detailed changes object (for complex updates like details_updated)
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for efficient queries by reservation and date
ReservationUpdateSchema.index({ reservationId: 1, createdAt: -1 });
ReservationUpdateSchema.index({ updatedBy: 1 });

// Virtual to format the update for display
ReservationUpdateSchema.virtual("formattedUpdate").get(function () {
  const timestamp = this.createdAt.toLocaleString();
  return {
    id: this._id,
    type: this.updateType,
    description: this.description,
    updatedBy: this.updatedByName || "System",
    timestamp,
    oldValue: this.oldValue,
    newValue: this.newValue,
    changes: this.changes,
  };
});

// Make sure virtuals are included in JSON output
ReservationUpdateSchema.set("toObject", { virtuals: true });
ReservationUpdateSchema.set("toJSON", { virtuals: true });

export default mongoose.model("ReservationUpdate", ReservationUpdateSchema);

