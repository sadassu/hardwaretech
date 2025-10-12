import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import ReservationDetail from "../models/ReservationDetail.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ProductVariant from "../models/ProductVariant.js";
import Sale from "../models/Sale.js";

// Add reservation with details
export const createReservation = asyncHandler(async (req, res) => {
  const { notes, totalPrice, reservationDetails, reservationDate } = req.body;

  let emptyFields = [];
  if (!totalPrice) emptyFields.push("totalPrice");
  if (!reservationDate) emptyFields.push("reservationDate");

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all required fields", emptyFields });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reservationData = {
      userId: req.user._id,
      reservationDate: reservationDate || Date.now(),
      status: "pending",
      totalPrice,
    };

    // ✅ only add notes if provided
    if (notes && notes.trim() !== "") {
      reservationData.notes = notes;
    }

    const [reservation] = await Reservation.create([reservationData], {
      session,
    });

    if (Array.isArray(reservationDetails) && reservationDetails.length > 0) {
      const detailsWithReservationId = reservationDetails.map((d) => ({
        ...d,
        reservationId: reservation._id,
      }));

      await ReservationDetail.insertMany(detailsWithReservationId, { session });
    }

    await session.commitTransaction();

    res.status(201).json({
      message: "Reservation created",
      reservation,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Reservation error:", err.message);
    res.status(500).json({ error: "Failed to create reservation" });
  } finally {
    session.endSession();
  }
});

export const updateReservation = asyncHandler(async (req, res) => {
  const { reservationDetails = [], remarks } = req.body || {};
  const reservationId = req.params.id;

  if (!reservationId) {
    return res.status(400).json({ message: "Reservation ID is required" });
  }

  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  const existingDetails = await ReservationDetail.find({ reservationId });
  if (!existingDetails.length) {
    return res.status(400).json({ message: "No reservation details found" });
  }

  const updatedDetails = [];
  const deletedDetails = [];
  const newDetails = [];

  const incomingMap = new Map(
    reservationDetails.map((d) => [String(d.productId), d])
  );

  for (const detail of existingDetails) {
    const incoming = incomingMap.get(String(detail.productId));

    if (!incoming) {
      await ReservationDetail.findByIdAndDelete(detail._id);
      deletedDetails.push(detail.productId);
    } else {
      let hasChanges = false;

      if (incoming.quantity !== detail.quantity) {
        detail.quantity = incoming.quantity;
        hasChanges = true;
      }
      if (incoming.size && incoming.size !== detail.size) {
        detail.size = incoming.size;
        hasChanges = true;
      }
      if (incoming.unit && incoming.unit !== detail.unit) {
        detail.unit = incoming.unit;
        hasChanges = true;
      }

      if (hasChanges) {
        await detail.save();
        updatedDetails.push(detail.productId);
      }

      incomingMap.delete(String(detail.productId));
    }
  }

  for (const incoming of incomingMap.values()) {
    const newDetail = new ReservationDetail({
      reservationId,
      productId: incoming.productId,
      quantity: incoming.quantity,
      size: incoming.size,
      unit: incoming.unit,
    });
    await newDetail.save();
    newDetails.push(newDetail.productId);
  }

  // ✅ Recalculate totalPrice using ProductVariant
  const allDetails = await ReservationDetail.find({ reservationId });
  let newTotalPrice = 0;

  for (const d of allDetails) {
    const variant = await ProductVariant.findOne({
      product: d.productId,
      unit: d.unit,
      size: d.size || null,
    });

    if (variant) {
      newTotalPrice += variant.price * d.quantity;
    }
  }

  reservation.totalPrice = newTotalPrice;

  if (remarks) {
    reservation.remarks = remarks;
  }

  await reservation.save();

  // ✅ Populate user and details
  const updatedReservation = await Reservation.findById(reservationId)
    .populate("userId", "name email role") // 👈 Add this
    .populate({
      path: "reservationDetails",
      populate: {
        path: "productId",
      },
    });

  return res.status(200).json({
    message: "Reservation updated successfully",
    reservation: updatedReservation,
    updated: updatedDetails,
    deleted: deletedDetails,
    added: newDetails,
    remarks: reservation.remarks,
    totalPrice: reservation.totalPrice,
  });
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
    .populate("reservationDetails")
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

export const updateReservationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  const allowedStatuses = ["pending", "confirmed", "cancelled", "failed"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  // Find and update reservation
  const reservation = await Reservation.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("userId", "name email")
    .populate("reservationDetails");

  if (!reservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  res.status(200).json({
    message: "Reservation status updated successfully",
    reservation,
  });
});

// Get ALL reservations (Admin) with user details
export const getAllReservations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "reservationDate";
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
  const status = req.query.status; // Get status filter from query params
  const skip = (page - 1) * limit;

  // Build query filter
  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }

  // Fetch reservations with user details + reservation details
  const reservations = await Reservation.find(filter)
    .populate("userId", "name email roles isActive")
    .populate("reservationDetails")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  // Count filtered reservations
  const total = await Reservation.countDocuments(filter);

  // Get status counts for all statuses
  const statusCountsRaw = await Reservation.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Initialize counts with all statuses
  const statusCounts = {
    all: await Reservation.countDocuments(),
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    failed: 0,
    completed: 0,
  };

  // Populate actual counts from aggregation
  statusCountsRaw.forEach((item) => {
    if (item._id && statusCounts.hasOwnProperty(item._id)) {
      statusCounts[item._id] = item.count;
    }
  });

  // Return 200 even if reservations array is empty
  res.status(200).json({
    total,
    page,
    pages: Math.ceil(total / limit),
    reservations: reservations || [],
    statusCounts,
  });
});

export const deleteReservation = asyncHandler(async (req, res) => {
  const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);

  if (!deleteReservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  res.status(200).json({ message: "Reservation deleted successfully" });
});

//take the reservation id
//take also the product variant of all the reservation details
//minus the all the quantity of the reservation details to the product variant
//change the reservation status to complete
export const completeReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amountPaid } = req.body;
  const cashierId = req.user._id; // from auth middleware

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find reservation
    const reservation = await Reservation.findById(id).session(session);
    if (!reservation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Reservation not found" });
    }

    // 2. Get reservation details
    const details = await ReservationDetail.find({ reservationId: id }).session(
      session
    );
    if (!details.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "No reservation details found" });
    }

    // 3. Update stock
    for (const detail of details) {
      const variant = await ProductVariant.findOne({
        product: detail.productId,
        size: detail.size,
        unit: detail.unit,
      }).session(session);

      if (!variant) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ error: `Variant not found for product ${detail.productId}` });
      }

      if (variant.quantity < detail.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ error: `Not enough stock for product ${detail.productId}` });
      }

      variant.quantity -= detail.quantity;
      await variant.save({ session });
    }

    // 4. Build sale items with product lookup
    const items = [];
    for (const d of details) {
      const variant = await ProductVariant.findOne({
        product: d.productId,
        size: d.size,
        unit: d.unit,
      })
        .populate("product")
        .session(session);

      if (!variant) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ error: `Variant not found for product ${d.productId}` });
      }

      items.push({
        productId: d.productId,
        name: variant.product.name,
        size: d.size,
        unit: d.unit,
        quantity: d.quantity,
        price: variant.price,
      });
    }

    // 5. Create Sale
    const sale = new Sale({
      items,
      amountPaid,
      cashier: cashierId,
      type: "reservation",
    });

    await sale.save({ session });

    // 6. Update reservation status
    reservation.status = "completed";
    await reservation.save({ session });

    // ✅ Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Reservation completed and sale recorded successfully",
      reservation,
      sale,
    });
  } catch (error) {
    // ❌ Rollback on error
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction failed:", error);
    res.status(500).json({ error: "Failed to complete reservation" });
  }
});
