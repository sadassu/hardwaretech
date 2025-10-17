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

router.post("/", requireAuth, createReservation);

router.get("/user/:userId", requireAuth, getReservationByUserId);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["admin", "cashier"]),
  deleteReservation
);

router.patch("/:id/cancel", requireAuth, cancelReservation);

router.get(
  "/",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getAllReservations
);

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
