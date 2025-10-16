import express from "express";
import {
  createReservation,
  getReservationByUserId,
  deleteReservation,
  getAllReservations,
  updateReservationStatus,
  completeReservation,
  updateReservation,
  cancelReservation,
} from "../controllers/reservationsController.js";
import requireAuth from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// @route   POST /api/reservations
// @desc    Create a new reservation with details
router.post("/", requireAuth, createReservation);

// @route   GET /api/reservations/user/:userId
// @desc    Get all reservations for a specific user (with pagination)
router.get("/user/:userId", getReservationByUserId);

// @route   DELETE /api/reservations/:id
// @desc    Delete a reservation by ID
router.delete(
  "/:id",
  requireAuth,
  requireRole(["admin", "cashier"]),
  deleteReservation
);

// @route PUT /api/reservation/:id/cancel
// @desc Update the reservation status to cancel
router.patch("/:id/cancel", requireAuth, cancelReservation);

// @route   GET /api/reservations
// @desc    Get all reservations (with pagination)
router.get("/", getAllReservations);

// @route   GET /api/reservations
router.put(
  "/:id/status",
  requireAuth,
  requireRole(["admin", "cashier"]),
  updateReservationStatus
);

router.patch(
  "/:id/complete",
  requireAuth,
  requireRole(["admin", "cashier"]),
  completeReservation
);

router.put(
  "/:id",
  requireAuth,
  requireRole(["admin", "cashier"]),
  updateReservation
);

export default router;
