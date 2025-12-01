// controllers/notificationsController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../utils/notifications.js";

/**
 * Get all notifications for the authenticated user
 * @route GET /api/notifications
 * @access Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;
  const read = req.query.read === "true" ? true : req.query.read === "false" ? false : null;

  const notifications = await getUserNotifications(userId, {
    limit,
    skip,
    read,
  });

  const total = await getUserNotifications(userId, {}).then(n => n.length);
  const unreadCount = await getUnreadNotificationCount(userId);

  res.status(200).json({
    total,
    page,
    pages: Math.ceil(total / limit),
    unreadCount,
    notifications,
  });
});

/**
 * Get unread notification count
 * @route GET /api/notifications/unread-count
 * @access Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const count = await getUnreadNotificationCount(userId);

  res.status(200).json({ unreadCount: count });
});

/**
 * Mark a notification as read
 * @route PUT /api/notifications/:id/read
 * @access Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await markNotificationAsRead(id, userId);

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.status(200).json({
    message: "Notification marked as read",
    notification,
  });
});

/**
 * Mark all notifications as read
 * @route PUT /api/notifications/read-all
 * @access Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const count = await markAllNotificationsAsRead(userId);

  res.status(200).json({
    message: "All notifications marked as read",
    count,
  });
});

