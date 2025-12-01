// routes/notificationRoutes.js
import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationsController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// Get all notifications for authenticated user
router.get("/", requireAuth, getNotifications);

// Get unread notification count
router.get("/unread-count", requireAuth, getUnreadCount);

// Mark a notification as read
router.put("/:id/read", requireAuth, markAsRead);

// Mark all notifications as read
router.put("/read-all", requireAuth, markAllAsRead);

export default router;

