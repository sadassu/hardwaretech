// utils/notifications.js
import Notification from "../models/Notification.js";
import Reservation from "../models/Reservation.js";
import ReservationDetail from "../models/ReservationDetail.js";

// Helper function to format variant label (similar to frontend)
const formatVariantLabel = (variant) => {
  if (!variant) return "";
  
  const size = variant.size ? String(variant.size).trim() : "";
  const unit = variant.unit ? String(variant.unit).trim() : "";
  const dimension = variant.dimension ? String(variant.dimension).trim() : "";
  const dimensionType = variant.dimensionType ? String(variant.dimensionType).trim() : "";
  const includePer = Boolean(variant.includePerText);

  // Priority 1: If size and unit exist, display as: "size unit" or "size per unit"
  if (size && unit) {
    return includePer ? `${size} per ${unit}` : `${size} ${unit}`;
  }

  // Priority 2: If dimension and unit exist (but no size)
  if (dimension && unit) {
    const dimLabel = dimensionType ? `${dimension} ${dimensionType}` : dimension;
    return `${unit.charAt(0).toUpperCase() + unit.slice(1)} (${dimLabel})`;
  }

  // Priority 3: If only dimension exists without unit
  if (dimension) {
    return dimensionType ? `${dimension} ${dimensionType}` : dimension;
  }

  // Fallback: return size or unit if available
  return size || unit || "";
};

/**
 * Create a notification for a user when a reservation update occurs
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - ID of the user to notify
 * @param {string} params.reservationId - ID of the reservation
 * @param {string} params.reservationUpdateId - ID of the ReservationUpdate record
 * @param {string} params.type - Type of notification
 * @param {string} params.message - Notification message
 * @param {Object} params.reservation - Reservation object with populated details
 */
export const createNotification = async ({
  userId,
  reservationId,
  reservationUpdateId,
  type,
  message,
  reservation,
}) => {
  try {
    // Skip "created" type - not a notification
    if (type === "created") {
      return null;
    }

    // Check if notification already exists for this update
    const existing = await Notification.findOne({
      userId,
      reservationUpdateId,
    });

    if (existing) {
      return existing; // Already notified
    }

    // Prepare reservation details snapshot
    const reservationDetails = [];
    if (reservation?.reservationDetails) {
      for (const detail of reservation.reservationDetails) {
        const variant = detail.productVariantId;
        const product = variant?.product || detail.productVariantId?.product;
        
        reservationDetails.push({
          productName: product?.name || variant?.product?.name || "Unknown Product",
          variantLabel: formatVariantLabel(variant || detail),
          quantity: detail.quantity || 0,
          price: detail.price || variant?.price || 0,
          subtotal: detail.subtotal || (detail.quantity || 0) * (detail.price || variant?.price || 0),
        });
      }
    }

    const notification = new Notification({
      userId,
      reservationId,
      reservationUpdateId,
      type,
      message,
      read: false,
      reservationData: {
        status: reservation?.status || "pending",
        totalPrice: reservation?.totalPrice || 0,
        remarks: reservation?.remarks || reservation?.notes || "",
        reservationDetails: reservationDetails.filter(d => d.productName),
      },
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of notifications
 */
export const getUserNotifications = async (userId, options = {}) => {
  const { limit = 50, skip = 0, read = null } = options;

  try {
    const query = { userId };
    if (read !== null) {
      query.read = read;
    }

    const notifications = await Notification.find(query)
      .populate("reservationId", "status totalPrice remarks")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return notifications;
  } catch (error) {
    console.error("Failed to get user notifications:", error);
    throw error;
  }
};

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Count of unread notifications
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    return await Notification.countDocuments({ userId, read: false });
  } catch (error) {
    console.error("Failed to get unread notification count:", error);
    return 0;
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for security)
 * @returns {Promise<Notification>} Updated notification
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true, readAt: new Date() },
      { new: true }
    );

    return notification;
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of notifications marked as read
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    throw error;
  }
};

