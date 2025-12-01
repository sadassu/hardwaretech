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

