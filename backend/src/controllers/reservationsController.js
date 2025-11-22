import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import ReservationDetail from "../models/ReservationDetail.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ProductVariant from "../models/ProductVariant.js";

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

    // ✅ Send email notification to user for new reservation
    try {
      const populatedReservation = await Reservation.findById(reservation._id).populate("userId", "name email");
      
      if (populatedReservation.userId && populatedReservation.userId.email) {
        // Populate reservation details with product information
        const reservationDetails = await ReservationDetail.find({ reservationId: reservation._id })
          .populate({
            path: "productVariantId",
            populate: { path: "product", select: "name" }
          });

        // Extract product information for email
        const products = reservationDetails.map(detail => ({
          name: detail.productVariantId?.product?.name || "Unknown Product",
          size: detail.productVariantId?.size || detail.size || "",
          unit: detail.productVariantId?.unit || detail.unit || "",
          quantity: detail.quantity || 1,
          price: detail.productVariantId?.price || 0
        }));

        const { sendEmail } = await import("../utils/sendEmail.js");
        const { getReservationStatusEmailTemplate } = await import("../utils/emailTemplates.js");

        const emailHtml = getReservationStatusEmailTemplate(
          populatedReservation.userId.name,
          populatedReservation._id.toString(),
          "pending",
          populatedReservation.reservationDate,
          populatedReservation.totalPrice,
          populatedReservation.notes || "",
          products
        );

        await sendEmail(
          populatedReservation.userId.email,
          "Reservation Created - Hardware Tech",
          emailHtml
        );

        console.log(`✅ New reservation email sent to ${populatedReservation.userId.email}`);
      }
    } catch (emailError) {
      console.error("❌ Failed to send new reservation email:", emailError);
      // Don't fail the request if email fails
    }

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
  const reservation = await Reservation.findById(reservationId).populate("userId", "name email");
  if (!reservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  // ✅ Check if the reservation is from the user requested
  if (reservation.userId._id.toString() != req.user._id.toString()) {
    return res
      .status(404)
      .json({ message: "This reservation is not your reservation" });
  }

  reservation.status = "cancelled";
  await reservation.save();

  // ✅ Send email notification to user
  if (reservation.userId && reservation.userId.email) {
    try {
      // Populate reservation details with product information
      const reservationDetails = await ReservationDetail.find({ reservationId: reservation._id })
        .populate({
          path: "productVariantId",
          populate: { path: "product", select: "name" }
        });

      // Extract product information for email
      const products = reservationDetails.map(detail => ({
        name: detail.productVariantId?.product?.name || "Unknown Product",
        size: detail.productVariantId?.size || detail.size || "",
        unit: detail.productVariantId?.unit || detail.unit || "",
        quantity: detail.quantity || 1,
        price: detail.productVariantId?.price || 0
      }));

      const { sendEmail } = await import("../utils/sendEmail.js");
      const { getReservationStatusEmailTemplate } = await import("../utils/emailTemplates.js");

      const emailHtml = getReservationStatusEmailTemplate(
        reservation.userId.name,
        reservation._id.toString(),
        "cancelled",
        reservation.reservationDate,
        reservation.totalPrice,
        reservation.remarks || "",
        products
      );

      await sendEmail(
        reservation.userId.email,
        "Reservation Cancelled - Hardware Tech",
        emailHtml
      );

      console.log(`✅ Cancellation email sent to ${reservation.userId.email}`);
    } catch (emailError) {
      console.error("❌ Failed to send cancellation email:", emailError);
      // Don't fail the request if email fails
    }
  }

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
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
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

  // ✅ Send email notification to user
  if (reservation.userId && reservation.userId.email) {
    try {
      // Populate reservation details with product information
      const reservationDetails = await ReservationDetail.find({ reservationId: reservation._id })
        .populate({
          path: "productVariantId",
          populate: { path: "product", select: "name" }
        });

      // Extract product information for email
      const products = reservationDetails.map(detail => ({
        name: detail.productVariantId?.product?.name || "Unknown Product",
        size: detail.productVariantId?.size || detail.size || "",
        unit: detail.productVariantId?.unit || detail.unit || "",
        quantity: detail.quantity || 1,
        price: detail.productVariantId?.price || 0
      }));

      const { sendEmail } = await import("../utils/sendEmail.js");
      const { getReservationStatusEmailTemplate } = await import("../utils/emailTemplates.js");

      const emailHtml = getReservationStatusEmailTemplate(
        reservation.userId.name,
        reservation._id.toString(),
        status,
        reservation.reservationDate,
        reservation.totalPrice,
        reservation.remarks || "",
        products
      );

      const statusTitles = {
        pending: "Reservation Pending",
        confirmed: "Reservation Confirmed",
        cancelled: "Reservation Cancelled",
        failed: "Reservation Failed",
      };

      await sendEmail(
        reservation.userId.email,
        `${statusTitles[status]} - Hardware Tech`,
        emailHtml
      );

      console.log(`✅ Status change email sent to ${reservation.userId.email}`);
    } catch (emailError) {
      console.error("❌ Failed to send status change email:", emailError);
      // Don't fail the request if email fails
    }
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
  const search = req.query.search; // Search query
  const skip = (page - 1) * limit;

  // Build query filter
  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }

  // If search query exists, we'll filter after populating
  // First, fetch all matching reservations
  let reservations = await Reservation.find(filter)
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
    .sort({ [sortBy]: sortOrder });

  // Apply search filter if provided
  if (search && search.trim()) {
    const searchLower = search.toLowerCase().trim();
    const searchTrimmed = search.trim();
    
    reservations = reservations.filter((reservation) => {
      const userId = reservation.userId;
      const reservationId = reservation._id.toString();
      
      // Search in user name
      const userNameMatch = userId?.name?.toLowerCase().includes(searchLower);
      // Search in user email
      const userEmailMatch = userId?.email?.toLowerCase().includes(searchLower);
      // Search in reservation ID (last 8 characters)
      const reservationIdMatch = reservationId.toLowerCase().includes(searchLower) || 
                                 reservationId.slice(-8).toLowerCase().includes(searchLower);
      
      // Search in product names
      let productNameMatch = false;
      if (reservation.reservationDetails && reservation.reservationDetails.length > 0) {
        productNameMatch = reservation.reservationDetails.some((detail) => {
          const product = detail.productVariantId?.product;
          if (product && product.name) {
            return product.name.toLowerCase().includes(searchLower);
          }
          return false;
        });
      }
      
      // Search in date (various date formats)
      let dateMatch = false;
      if (reservation.reservationDate) {
        const reservationDate = new Date(reservation.reservationDate);
        // Try to parse the search query as a date
        const searchDate = new Date(searchTrimmed);
        
        // Check if search is a valid date
        if (!isNaN(searchDate.getTime())) {
          // Compare dates (ignore time)
          const resDateStr = reservationDate.toISOString().split('T')[0];
          const searchDateStr = searchDate.toISOString().split('T')[0];
          dateMatch = resDateStr === searchDateStr;
        }
        
        // Also check formatted date strings
        const dateFormats = [
          reservationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase(),
          reservationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase(),
          reservationDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toLowerCase(),
          reservationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase(),
          reservationDate.toLocaleDateString('en-US').toLowerCase(),
          reservationDate.toISOString().split('T')[0], // YYYY-MM-DD format
        ];
        
        dateMatch = dateMatch || dateFormats.some(format => format.includes(searchLower));
      }
      
      return userNameMatch || userEmailMatch || reservationIdMatch || productNameMatch || dateMatch;
    });
  }

  // Get total count before pagination (after search filter if applied)
  const total = reservations.length;

  // Apply pagination
  reservations = reservations.slice(skip, skip + limit);

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
