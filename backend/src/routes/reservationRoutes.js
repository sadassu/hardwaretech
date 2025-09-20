import express from "express";
import {
  createReservation,
  getReservationByUserId,
  deleteReservation,
  getAllReservations,
  updateReservationStatus,
} from "../controllers/reservationsController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// @route   POST /api/reservations
// @desc    Create a new reservation with details
router.post("/", requireAuth, createReservation);

// @route   GET /api/reservations/user/:userId
// @desc    Get all reservations for a specific user (with pagination)
router.get("/user/:userId", getReservationByUserId);

// @route   DELETE /api/reservations/:id
// @desc    Delete a reservation by ID
router.delete("/:id", deleteReservation);

// @route   GET /api/reservations
// @desc    Get all reservations (with pagination)
router.get("/", getAllReservations);

// @route   GET /api/reservations
router.put("/:id/status", requireAuth, updateReservationStatus);

export default router;
