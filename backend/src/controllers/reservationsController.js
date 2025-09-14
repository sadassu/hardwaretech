import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import ReservationDetail from "../models/ReservationDetail.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Add reservation with details
export const createReservation = asyncHandler(async (req, res) => {
  const { userId, notes, totalPrice, reservationDetails, reservationDate } =
    req.body;

  let emptyFields = [];

  if (!userId) emptyFields.push("userId");
  if (!totalPrice) emptyFields.push("totalPrice");
  if (!reservationDate) emptyFields.push("reservationDate");

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all fields", emptyFields });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Reservation
    const [reservation] = await Reservation.create(
      [
        {
          userId,
          reservationDate: reservationDate || Date.now(),
          status: "pending",
          notes,
          totalPrice,
        },
      ],
      { session }
    );

    // Details
    if (Array.isArray(reservationDetails)) {
      const detailsWithReservationId = reservationDetails.map((d) => ({
        ...d,
        reservationId: reservation._id,
      }));

      await ReservationDetail.insertMany(detailsWithReservationId, { session });
    }

    await session.commitTransaction();
    res.status(201).json({ message: "Reservation created", reservation });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

// Get reservations by userID
export const getReservationByUserId = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "reservationDate";
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

  const skip = (page - 1) * limit;

  // Fetch reservations
  const reservations = await Reservation.find({ userId: req.params.userId })
    .populate("reservationDetail")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  if (!reservations || reservations.length === 0) {
    return res
      .status(404)
      .json({ message: "There are no reservations for this user" });
  }

  // Count total reservations for this user
  const total = await Reservation.countDocuments({ userId: req.params.userId });

  res.status(200).json({
    total,
    page,
    pages: Math.ceil(total / limit),
    reservations,
  });
});

// Get ALL reservations (Admin) with user details
export const getAllReservations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "reservationDate";
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

  const skip = (page - 1) * limit;

  // Fetch reservations with user details + reservation details
  const reservations = await Reservation.find()
    .populate("userId", "name email roles isActive") // show specific fields from user
    .populate({
      path: "reservationDetail", // if Reservation has `reservationDetail` ref
      model: "ReservationDetail",
    })
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  if (!reservations || reservations.length === 0) {
    return res.status(404).json({ message: "No reservations found" });
  }

  // Count all reservations
  const total = await Reservation.countDocuments();

  res.status(200).json({
    total,
    page,
    pages: Math.ceil(total / limit),
    reservations,
  });
});

export const deleteReservation = asyncHandler(async (req, res) => {
  const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);

  if (!deleteReservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  res.status(200).json({ message: "Reservation deleted successfully" });
});
