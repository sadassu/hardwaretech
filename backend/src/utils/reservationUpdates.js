// utils/reservationUpdates.js
import ReservationUpdate from "../models/ReservationUpdate.js";
import User from "../models/User.js";

/**
 * Log a reservation update to the database
 * @param {Object} params - Update parameters
 * @param {string} params.reservationId - ID of the reservation
 * @param {string} params.updateType - Type of update (created, status_changed, etc.)
 * @param {string} params.updatedBy - User ID who made the update
 * @param {string} params.description - Human-readable description
 * @param {string} [params.oldValue] - Old value (e.g., old status)
 * @param {string} [params.newValue] - New value (e.g., new status)
 * @param {Object} [params.changes] - Detailed changes object
 * @param {Object} [params.metadata] - Additional metadata
 */
export const logReservationUpdate = async ({
  reservationId,
  updateType,
  updatedBy,
  description,
  oldValue = null,
  newValue = null,
  changes = {},
  metadata = {},
}) => {
  try {
    // Get user info for persistence
    const user = await User.findById(updatedBy).select("name email").lean();
    
    const update = new ReservationUpdate({
      reservationId,
      updateType,
      updatedBy,
      updatedByName: user?.name || "System",
      updatedByEmail: user?.email || "",
      description,
      oldValue,
      newValue,
      changes,
      metadata,
    });

    await update.save();
    
    // Create notification for the reservation owner (if update is not by the owner themselves)
    // Only create notifications for updates that matter to the customer
    if (updateType !== "created" && updateType !== "cancelled") {
      try {
        const Reservation = (await import("../models/Reservation.js")).default;
        const reservation = await Reservation.findById(reservationId)
          .populate({
            path: "reservationDetails",
            populate: {
              path: "productVariantId",
              populate: { path: "product", select: "name" },
            },
          })
          .lean();

        if (reservation && reservation.userId && reservation.userId.toString() !== updatedBy.toString()) {
          const { createNotification } = await import("./notifications.js");
          
          // Generate notification message based on update type
          let message = "";
          switch (updateType) {
            case "status_changed":
              switch (newValue) {
                case "confirmed":
                  message = "Your reservation has been confirmed!";
                  break;
                case "completed":
                  message = "Your reservation has been completed!";
                  break;
                default:
                  message = `Your reservation status changed to ${newValue}.`;
              }
              break;
            case "remarks_updated":
              message = newValue && newValue !== "no remarks"
                ? "Remarks have been added to your reservation."
                : "Your reservation has been updated.";
              break;
            case "details_updated":
              message = "Your reservation details have been updated.";
              break;
            case "total_price_changed":
              message = "Your reservation total price has been updated.";
              break;
            default:
              message = description || "Your reservation has been updated.";
          }

          await createNotification({
            userId: reservation.userId.toString(),
            reservationId: reservationId.toString(),
            reservationUpdateId: update._id.toString(),
            type: updateType,
            message,
            reservation,
          });
        }
      } catch (notifError) {
        // Don't fail if notification creation fails
        console.error("Failed to create notification:", notifError);
      }
    }
    
    return update;
  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error("Failed to log reservation update:", error);
    return null;
  }
};

/**
 * Get all updates for a reservation
 * @param {string} reservationId - ID of the reservation
 * @param {Object} options - Query options (limit, skip, sort)
 * @returns {Promise<Array>} Array of updates
 */
export const getReservationUpdates = async (reservationId, options = {}) => {
  const { limit = 50, skip = 0, sort = -1 } = options;
  
  try {
    const updates = await ReservationUpdate.find({ reservationId })
      .populate("updatedBy", "name email")
      .sort({ createdAt: sort })
      .limit(limit)
      .skip(skip)
      .lean();

    return updates;
  } catch (error) {
    console.error("Failed to get reservation updates:", error);
    throw error;
  }
};

/**
 * Get update count for a reservation
 * @param {string} reservationId - ID of the reservation
 * @returns {Promise<number>} Count of updates
 */
export const getReservationUpdateCount = async (reservationId) => {
  try {
    return await ReservationUpdate.countDocuments({ reservationId });
  } catch (error) {
    console.error("Failed to get reservation update count:", error);
    return 0;
  }
};

