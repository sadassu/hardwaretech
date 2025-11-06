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
        productVariantId: d.productVariantId || d.variantId || d._id,
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

// @desc cancel the reservation
// @route PUT /api/reservation/:id/cancel
// @access requir auth, same user._id with reservation.user._id
export const cancelReservation = asyncHandler(async (req, res) => {
  const reservationId = req.params.id;

  // 🔍 Reservation required!
  if (!reservationId) {
    return res.status(400).json({ message: "Reservation ID is required" });
  }

  // 🔍 Find reservation
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  // ✅ Check if the reservation is from the user requested
  if (reservation.userId.toString() != req.user._id.toString()) {
    return res
      .status(404)
      .json({ message: "This reservation is not your reservation" });
  }

  reservation.status = "cancelled";
  await reservation.save();

  return res
    .status(200)
    .json({ message: "Reservation cancelled successfully." });
});

// @desc update reservation change reservation status (pending, confirmed, cancelled)
// @route PUT /api/reservations/:id
// @access require auth and role (admin, cashier)
export const updateReservation = asyncHandler(async (req, res) => {
  const { reservationDetails = [], remarks } = req.body || {};
  const reservationId = req.params.id;

  if (!reservationId) {
    return res.status(400).json({ message: "Reservation ID is required" });
  }

  // 🔍 Find reservation
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  // 🔍 Existing details
  const existingDetails = await ReservationDetail.find({ reservationId });

  const updatedDetails = [];
  const deletedDetails = [];
  const newDetails = [];

  // 🗺️ Map incoming by variant ID
  const incomingMap = new Map(
    reservationDetails.map((d) => [String(d.productVariantId), d])
  );

  // 🔁 Compare existing with incoming
  for (const detail of existingDetails) {
    const incoming = incomingMap.get(String(detail.productVariantId));

    if (!incoming) {
      // ❌ removed
      await ReservationDetail.findByIdAndDelete(detail._id);
      deletedDetails.push(detail.productVariantId);
      continue;
    }

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
      updatedDetails.push(detail.productVariantId);
    }

    // Remove from map
    incomingMap.delete(String(detail.productVariantId));
  }

  // ➕ Add new ones
  for (const incoming of incomingMap.values()) {
    const newDetail = new ReservationDetail({
      reservationId,
      productVariantId: incoming.productVariantId,
      quantity: incoming.quantity,
      size: incoming.size,
      unit: incoming.unit,
    });
    await newDetail.save();
    newDetails.push(newDetail.productVariantId);
  }

  // 🧮 Recalculate total price
  const allDetails = await ReservationDetail.find({ reservationId });
  const variantIds = allDetails.map((d) => d.productVariantId);

  const variants = await ProductVariant.find({ _id: { $in: variantIds } });
  const variantMap = new Map(variants.map((v) => [String(v._id), v]));

  let newTotalPrice = 0;
  for (const d of allDetails) {
    const variant = variantMap.get(String(d.productVariantId));
    if (variant) {
      newTotalPrice += variant.price * d.quantity;
    }
  }

  reservation.totalPrice = newTotalPrice;
  if (remarks) reservation.remarks = remarks;
  await reservation.save();

  // 📦 Populate for frontend
  const updatedReservation = await Reservation.findById(reservationId)
    .populate("userId", "name email role")
    .populate({
      path: "reservationDetails",
      populate: { path: "productVariantId" },
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

// Get reservations by User ID (with product + variant details)
export const getReservationByUserId = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "reservationDate";
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
  const skip = (page - 1) * limit;
  const status = req.query.status; // Optional filter for user reservations

  // ✅ Build query filter
  const filter = { userId };
  if (status && status !== "all") {
    filter.status = status;
  }

  // ✅ Fetch reservations with full details
  const reservations = await Reservation.find(filter)
    .populate({
      path: "reservationDetails",
      populate: {
        path: "productVariantId",
        populate: {
          path: "product",
          select: "name category image description", // fields from Product model
        },
      },
    })
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  // ✅ Count total reservations (with filter)
  const total = await Reservation.countDocuments(filter);

  // ✅ Compute status counts per user
  const statusAggregation = await Reservation.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const statusCounts = {
    all: total,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    failed: 0,
    completed: 0,
  };

  // ✅ Map aggregation results
  statusAggregation.forEach((s) => {
    if (statusCounts[s._id] !== undefined) {
      statusCounts[s._id] = s.count;
    }
  });

  // ✅ Handle no reservations gracefully
  if (!reservations || reservations.length === 0) {
    return res.status(200).json({
      message: "There are no reservations for this user",
      total: 0,
      page,
      pages: 0,
      reservations: [],
      statusCounts,
    });
  }

  // ✅ Return full data with product + variant details
  res.status(200).json({
    total,
    page,
    pages: Math.ceil(total / limit),
    reservations,
    statusCounts,
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
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const status = req.query.status;
  const skip = (page - 1) * limit;

  // Build query filter
  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }

  // Fetch reservations with user details + reservation details
  const reservations = await Reservation.find(filter)
    .populate("userId", "name email roles isActive")
    .populate({
      path: "reservationDetails",
      populate: {
        path: "productVariantId",
        populate: {
          path: "product",
          select: "name category image description",
        },
      },
    })
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
    // 1️⃣ Find reservation
    const reservation = await Reservation.findById(id).session(session);
    if (!reservation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Reservation not found" });
    }

    // 2️⃣ Find reservation details
    const details = await ReservationDetail.find({ reservationId: id })
      .populate({
        path: "productVariantId",
        populate: { path: "product" }, // include product info for name, etc.
      })
      .session(session);

    if (!details.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "No reservation details found" });
    }

    // 3️⃣ Validate and update stock
    for (const detail of details) {
      const variant = detail.productVariantId;

      if (!variant) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          error: `Product variant not found for reservation detail ${detail._id}`,
        });
      }

      if (variant.quantity < detail.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          error: `Not enough stock for ${variant.product?.name || "variant"} (${
            variant.size || "no size"
          } ${variant.unit})`,
        });
      }

      variant.quantity -= detail.quantity;
      await variant.save({ session });
    }

    // 4️⃣ Build sale items
    const items = details.map((d) => ({
      productVariantId: d.productVariantId._id,
      productId: d.productVariantId.product._id,
      name: d.productVariantId.product.name,
      size: d.productVariantId.size,
      unit: d.productVariantId.unit,
      quantity: d.quantity,
      price: d.productVariantId.price,
      subtotal: d.productVariantId.price * d.quantity,
    }));

    // 5️⃣ Create Sale document
    const sale = new Sale({
      items,
      amountPaid,
      cashier: cashierId,
      type: "reservation",
      totalAmount: items.reduce((sum, item) => sum + item.subtotal, 0),
    });

    await sale.save({ session });

    // 6️⃣ Update reservation status
    reservation.status = "completed";
    await reservation.save({ session });

    // ✅ Commit
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Reservation completed and sale recorded successfully",
      reservation,
      sale,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction failed:", error);
    return res.status(500).json({ error: "Failed to complete reservation" });
  }
});
