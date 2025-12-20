import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import ReservationDetail from "../models/ReservationDetail.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ProductVariant from "../models/ProductVariant.js";
import User from "../models/User.js";
import { emitGlobalUpdate } from "../services/realtime.js";
import { logReservationUpdate } from "../utils/reservationUpdates.js";

// Add reservation with details
export const createReservation = asyncHandler(async (req, res) => {
  const { notes, totalPrice, reservationDetails, reservationDate } = req.body;

  let emptyFields = [];
  if (!reservationDate) emptyFields.push("reservationDate");

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all required fields", emptyFields });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get user info to store for persistence
    const user = await User.findById(req.user._id).select("name email").session(session);
    
    const reservationData = {
      userId: req.user._id,
      userName: user?.name || "Unknown User",
      userEmail: user?.email || "",
      reservationDate: reservationDate || Date.now(),
      status: "pending",
      totalPrice: 0,
    };

    // ✅ only add notes if provided
    if (notes && notes.trim() !== "") {
      reservationData.notes = notes;
    }

    const [reservation] = await Reservation.create([reservationData], {
      session,
    });

    let computedTotal = 0;
    if (Array.isArray(reservationDetails) && reservationDetails.length > 0) {
      const variantIds = [
        ...new Set(
          reservationDetails
            .map((d) => d.productVariantId || d.variantId || d._id)
            .filter(Boolean)
        ),
      ];

      const variants = await ProductVariant.find({ _id: { $in: variantIds } })
        .populate("product", "name")
        .select("price size unit color product")
        .session(session);
      const variantMap = new Map(
        variants.map((variant) => [String(variant._id), variant])
      );

      const detailsWithReservationId = reservationDetails.map((d) => {
        const variantId = d.productVariantId || d.variantId || d._id;
        const variant = variantMap.get(String(variantId));
        const quantity = Number(d.quantity) || 0;
        const unitPrice =
          typeof d.price === "number" ? d.price : variant?.price || 0;
        const subtotal = unitPrice * quantity;
        computedTotal += subtotal;

        return {
          reservationId: reservation._id,
          productVariantId: variantId,
          productName: variant?.product?.name || "Unknown Product",
          variantSize: variant?.size || d.size || "",
          variantUnit: variant?.unit || d.unit || "",
          variantColor: variant?.color || "",
          quantity,
          size: d.size || variant?.size,
          unit: d.unit || variant?.unit,
          price: unitPrice,
          subtotal,
        };
      });

      await ReservationDetail.insertMany(detailsWithReservationId, { session });
    }

    reservation.totalPrice =
      computedTotal > 0 ? computedTotal : Number(totalPrice) || 0;
    await reservation.save({ session });

    await session.commitTransaction();

    // ✅ Log reservation creation - MUST be saved to database
    // This ensures the update is persisted even if page reloads
    try {
      await logReservationUpdate({
        reservationId: reservation._id,
        updateType: "created",
        updatedBy: req.user._id,
        description: `Reservation created with ${reservationDetails?.length || 0} item(s). Total: ₱${reservation.totalPrice.toFixed(2)}`,
        newValue: "pending",
        metadata: {
          totalPrice: reservation.totalPrice,
          itemCount: reservationDetails?.length || 0,
        },
      });
    } catch (logError) {
      // Log error but don't fail the request
      console.error("Failed to log reservation creation:", logError);
    }

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
          price: detail.price ?? detail.productVariantId?.price ?? 0
        }));

        const { sendReservationCreatedEmail } = await import("../services/emailService.js");

        // Non-blocking: Send email asynchronously without waiting
        sendReservationCreatedEmail(
          populatedReservation.userId.email,
          populatedReservation.userId.name,
          {
            reservationId: populatedReservation._id.toString(),
            status: "pending",
            reservationDate: populatedReservation.reservationDate,
            totalPrice: populatedReservation.totalPrice,
            remarks: populatedReservation.notes || "",
            products: products
          }
        ).then(() => {
          console.log(`✅ New reservation email sent to ${populatedReservation.userId.email}`);
        });
      }
    } catch (emailError) {
      console.error("❌ Failed to send new reservation email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: "Reservation created",
      reservation,
    });

    // ✅ Explicitly trigger Pusher update for new reservation (after response is sent)
    // This ensures the update is sent even if middleware doesn't catch it
    emitGlobalUpdate({
      method: "POST",
      path: "/api/reservations",
      statusCode: 201,
      topics: ["reservations"],
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

  const oldStatus = reservation.status;
  reservation.status = "cancelled";
  await reservation.save();

  // ✅ Log cancellation - MUST be saved to database
  try {
    await logReservationUpdate({
      reservationId: reservation._id,
      // Treat this as a status change so history doesn't show a separate
      // "Reservation cancelled by user" entry in addition to other cancel logs.
      updateType: "status_changed",
      updatedBy: req.user._id,
      description: `Reservation status changed from "${oldStatus}" to "cancelled" by user`,
      oldValue: oldStatus,
      newValue: "cancelled",
    });
  } catch (logError) {
    console.error("Failed to log reservation cancellation:", logError);
  }

  // ✅ Emit WebSocket update for real-time notifications
  emitGlobalUpdate({
    method: "PUT",
    path: `/api/reservations/${reservation._id}/cancel`,
    statusCode: 200,
    topics: ["reservations"],
    reservationId: reservation._id.toString(),
    userId: reservation.userId._id.toString(),
  });

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
        price: detail.price ?? detail.productVariantId?.price ?? 0
      }));

      const { sendReservationStatusEmail } = await import("../services/emailService.js");

      // Non-blocking: Send email asynchronously without waiting
      sendReservationStatusEmail(
        reservation.userId.email,
        reservation.userId.name,
        {
          reservationId: reservation._id.toString(),
          status: "cancelled",
          reservationDate: reservation.reservationDate,
          totalPrice: reservation.totalPrice,
          remarks: reservation.remarks || "",
          products: products
        }
      ).then(() => {
        console.log(`✅ Cancellation email sent to ${reservation.userId.email}`);
      });
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

  // Store old values for logging
  const oldTotalPrice = reservation.totalPrice;
  const oldRemarks = reservation.remarks || "";

  // 🔍 Existing details
  const existingDetails = await ReservationDetail.find({ reservationId });

  const updatedDetails = [];
  const deletedDetails = [];
  const newDetails = [];

  const existingVariantIds = existingDetails.map((d) => d.productVariantId);
  const incomingVariantIds = reservationDetails
    .map((d) => d.productVariantId || d.variantId || d._id)
    .filter(Boolean);
  const variantIds = [
    ...new Set(
      [...existingVariantIds, ...incomingVariantIds].map((id) => String(id))
    ),
  ];

  const variantDocs = variantIds.length
    ? await ProductVariant.find({ _id: { $in: variantIds } })
        .populate("product", "name")
        .select("price size unit color product")
    : [];
  const variantMap = new Map(
    variantDocs.map((variant) => [String(variant._id), variant])
  );

  // 🗺️ Map incoming by variant ID
  const incomingMap = new Map(
    reservationDetails.map((d) => [
      String(d.productVariantId || d.variantId || d._id),
      d,
    ])
  );

  // 🔁 Compare existing with incoming
  for (const detail of existingDetails) {
    const key = String(detail.productVariantId);
    const incoming = incomingMap.get(key);

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
    if (
      Object.prototype.hasOwnProperty.call(incoming, "price") &&
      incoming.price !== detail.price
    ) {
      detail.price = incoming.price;
      hasChanges = true;
    }

    const variant = variantMap.get(key);
    let lockedPrice =
      detail.price !== undefined && detail.price !== null
        ? detail.price
        : incoming.price ?? variant?.price ?? 0;
    if (detail.price === undefined || detail.price === null) {
      detail.price = lockedPrice;
      hasChanges = true;
    }
    const newSubtotal = lockedPrice * detail.quantity;
    if (detail.subtotal !== newSubtotal) {
      detail.subtotal = newSubtotal;
      hasChanges = true;
    }

    // Update stored product/variant information
    // Always update if variant exists (to keep it current), but preserve if variant is deleted
    if (variant) {
      // Update stored information when variant exists
      const newProductName = variant.product?.name || "Unknown Product";
      if (detail.productName !== newProductName) {
        detail.productName = newProductName;
        hasChanges = true;
      }
      if (variant.size && detail.variantSize !== variant.size) {
        detail.variantSize = variant.size;
        hasChanges = true;
      }
      if (variant.unit && detail.variantUnit !== variant.unit) {
        detail.variantUnit = variant.unit;
        hasChanges = true;
      }
      if (variant.color && detail.variantColor !== variant.color) {
        detail.variantColor = variant.color;
        hasChanges = true;
      }
    }
    // If variant doesn't exist, keep the stored information (don't overwrite)

    if (hasChanges) {
      await detail.save();
      updatedDetails.push(detail.productVariantId);
    }

    // Remove from map
    incomingMap.delete(key);
  }

  // ➕ Add new ones
  for (const incoming of incomingMap.values()) {
    const variantId = incoming.productVariantId || incoming.variantId || incoming._id;
    const variant = variantMap.get(String(variantId));
    const quantity = Number(incoming.quantity) || 0;
    const size = incoming.size || variant?.size;
    const unit = incoming.unit || variant?.unit;
    const unitPrice =
      typeof incoming.price === "number" ? incoming.price : variant?.price || 0;

    const newDetail = new ReservationDetail({
      reservationId,
      productVariantId: variantId,
      productName: variant?.product?.name || "Unknown Product",
      variantSize: variant?.size || size || "",
      variantUnit: variant?.unit || unit || "",
      variantColor: variant?.color || "",
      quantity,
      size,
      unit,
      price: unitPrice,
      subtotal: unitPrice * quantity,
    });
    await newDetail.save();
    newDetails.push(newDetail.productVariantId);
  }

  // 🧮 Recalculate total price using locked prices
  const allDetails = await ReservationDetail.find({ reservationId });

  let newTotalPrice = 0;
  for (const detail of allDetails) {
    const variant = variantMap.get(String(detail.productVariantId));
    let lockedPrice =
      detail.price !== undefined && detail.price !== null
        ? detail.price
        : variant?.price ?? 0;
    if (detail.price === undefined || detail.price === null) {
      detail.price = lockedPrice;
      detail.subtotal = lockedPrice * detail.quantity;
      await detail.save();
    } else if (detail.subtotal !== lockedPrice * detail.quantity) {
      detail.subtotal = lockedPrice * detail.quantity;
      await detail.save();
    }
    newTotalPrice += lockedPrice * detail.quantity;
  }

  reservation.totalPrice = newTotalPrice;
  
  // Update remarks if provided (even if empty string - to allow clearing remarks)
  if (remarks !== undefined) {
    reservation.remarks = remarks || "no remarks";
  }
  await reservation.save();

  // ✅ Log updates - MUST be saved to database before response
  const updateLogs = [];
  
  // Log details update if items were changed
  if (updatedDetails.length > 0 || deletedDetails.length > 0 || newDetails.length > 0) {
    const changes = {
      updated: updatedDetails.length,
      deleted: deletedDetails.length,
      added: newDetails.length,
    };
    updateLogs.push(
      logReservationUpdate({
        reservationId: reservation._id,
        updateType: "details_updated",
        updatedBy: req.user._id,
        description: `Reservation details updated: ${changes.added} added, ${changes.updated} updated, ${changes.deleted} removed`,
        changes,
        metadata: {
          updatedVariantIds: updatedDetails,
          deletedVariantIds: deletedDetails,
          newVariantIds: newDetails,
        },
      })
    );
  }

  // Log remarks update if changed (including when cleared)
  const newRemarks = remarks !== undefined ? (remarks || "no remarks") : reservation.remarks || "no remarks";
  if (remarks !== undefined && newRemarks !== oldRemarks) {
    updateLogs.push(
      logReservationUpdate({
        reservationId: reservation._id,
        updateType: "remarks_updated",
        updatedBy: req.user._id,
        description: `Remarks ${remarks ? "updated" : "cleared"}`,
        oldValue: oldRemarks || "no remarks",
        newValue: newRemarks,
      })
    );
  }

  // Log total price change if changed
  if (oldTotalPrice !== newTotalPrice) {
    updateLogs.push(
      logReservationUpdate({
        reservationId: reservation._id,
        updateType: "total_price_changed",
        updatedBy: req.user._id,
        description: `Total price changed from ₱${oldTotalPrice.toFixed(2)} to ₱${newTotalPrice.toFixed(2)}`,
        oldValue: oldTotalPrice.toString(),
        newValue: newTotalPrice.toString(),
        metadata: {
          priceDifference: newTotalPrice - oldTotalPrice,
        },
      })
    );
  }

  // ✅ CRITICAL: Wait for all logs to complete and save to database
  // This ensures updates are persisted before response is sent
  const logResults = await Promise.allSettled(updateLogs);
  
  // Log any failures (but don't fail the request)
  logResults.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Failed to log reservation update ${index}:`, result.reason);
    }
  });

  // ✅ Emit WebSocket update for real-time notifications
  emitGlobalUpdate({
    method: "PUT",
    path: `/api/reservations/${reservationId}`,
    statusCode: 200,
    topics: ["reservations"],
    reservationId: reservation._id.toString(),
    userId: reservation.userId?.toString() || reservation.userId?._id?.toString(),
  });

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

  // Find reservation first to get old status
  const oldReservation = await Reservation.findById(id);
  if (!oldReservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  const oldStatus = oldReservation.status;

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

  // ✅ Log status change - MUST be saved to database
  if (oldStatus !== status) {
    try {
      await logReservationUpdate({
        reservationId: reservation._id,
        updateType: "status_changed",
        updatedBy: req.user._id,
        description: `Reservation status changed from "${oldStatus}" to "${status}"`,
        oldValue: oldStatus,
        newValue: status,
        metadata: {
          changedBy: req.user.roles?.includes("admin") ? "admin" : "cashier",
        },
      });
    } catch (logError) {
      console.error("Failed to log status change:", logError);
    }
  }

  // ✅ Emit WebSocket update for real-time notifications
  emitGlobalUpdate({
    method: "PUT",
    path: `/api/reservations/${id}/status`,
    statusCode: 200,
    topics: ["reservations"],
    reservationId: reservation._id.toString(),
    userId: reservation.userId?._id?.toString() || reservation.userId?.toString(),
    status: status,
  });

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
        price: detail.price ?? detail.productVariantId?.price ?? 0
      }));

      const { sendReservationStatusEmail } = await import("../services/emailService.js");

      // Non-blocking: Send email asynchronously without waiting
      sendReservationStatusEmail(
        reservation.userId.email,
        reservation.userId.name,
        {
          reservationId: reservation._id.toString(),
          status: status,
          reservationDate: reservation.reservationDate,
          totalPrice: reservation.totalPrice,
          remarks: reservation.remarks || "",
          products: products
        }
      ).then(() => {
        console.log(`✅ Status change email sent to ${reservation.userId.email}`);
      });
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
      
      // Search in user name (check both populated and stored names)
      const userNameMatch = userId?.name?.toLowerCase().includes(searchLower) ||
                            reservation.userName?.toLowerCase().includes(searchLower);
      // Search in user email (check both populated and stored emails)
      const userEmailMatch = userId?.email?.toLowerCase().includes(searchLower) ||
                             reservation.userEmail?.toLowerCase().includes(searchLower);
      // Search in reservation ID (last 8 characters)
      const reservationIdMatch = reservationId.toLowerCase().includes(searchLower) || 
                                 reservationId.slice(-8).toLowerCase().includes(searchLower);
      
      // Search in product names (check both populated and stored names)
      let productNameMatch = false;
      if (reservation.reservationDetails && reservation.reservationDetails.length > 0) {
        productNameMatch = reservation.reservationDetails.some((detail) => {
          const product = detail.productVariantId?.product;
          const storedProductName = detail.productName;
          // Check both populated product name and stored product name
          if (product && product.name) {
            return product.name.toLowerCase().includes(searchLower);
          }
          if (storedProductName) {
            return storedProductName.toLowerCase().includes(searchLower);
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
        
        // Generate various date format strings for matching
        const year = reservationDate.getFullYear();
        const month = reservationDate.getMonth() + 1;
        const day = reservationDate.getDate();
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                           'july', 'august', 'september', 'october', 'november', 'december'];
        const monthShortNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                                'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        
        // Create date format strings
        const dateFormats = [
          // ISO format: YYYY-MM-DD
          reservationDate.toISOString().split('T')[0],
          // MM/DD/YYYY
          `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`,
          // DD/MM/YYYY
          `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`,
          // MM-DD-YYYY
          `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}-${year}`,
          // DD-MM-YYYY
          `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`,
          // M/D/YYYY (without leading zeros)
          `${month}/${day}/${year}`,
          // D/M/YYYY (without leading zeros)
          `${day}/${month}/${year}`,
          // Full month name formats
          `${monthNames[month - 1]} ${day}, ${year}`.toLowerCase(),
          `${monthShortNames[month - 1]} ${day}, ${year}`.toLowerCase(),
          `${monthNames[month - 1]} ${day}`.toLowerCase(),
          `${monthShortNames[month - 1]} ${day}`.toLowerCase(),
          // Locale date strings
          reservationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase(),
          reservationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase(),
          reservationDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toLowerCase(),
          reservationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase(),
          reservationDate.toLocaleDateString('en-US').toLowerCase(),
        ];
        
        // Check if search matches any date format
        dateMatch = dateMatch || dateFormats.some(format => format.includes(searchLower));
        
        // Also check if search contains date components (e.g., "2024", "january", "01/15")
        const searchContainsYear = searchLower.includes(year.toString());
        const searchContainsMonth = monthNames.some((name, idx) => 
          (idx + 1 === month && searchLower.includes(name)) || 
          (idx + 1 === month && searchLower.includes(monthShortNames[idx]))
        );
        const searchContainsDay = searchLower.includes(day.toString()) || 
                                 searchLower.includes(day.toString().padStart(2, '0'));
        
        // If search contains multiple date components, consider it a match
        if ((searchContainsYear && searchContainsMonth) || 
            (searchContainsYear && searchContainsDay) ||
            (searchContainsMonth && searchContainsDay)) {
          dateMatch = true;
        }
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

  if (!deletedReservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  res.status(200).json({ message: "Reservation deleted successfully" });
});

// Get all updates for a specific reservation
export const getReservationUpdates = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  // Verify reservation exists and user has access
  const reservation = await Reservation.findById(id);
  if (!reservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  // Check if user has access (admin/cashier can see all, users can only see their own)
  const isAdminOrCashier = req.user.roles?.includes("admin") || req.user.roles?.includes("cashier");
  const isOwner = reservation.userId?.toString() === req.user._id.toString();

  if (!isAdminOrCashier && !isOwner) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Get updates
  const { getReservationUpdates, getReservationUpdateCount } = await import("../utils/reservationUpdates.js");
  
  const updates = await getReservationUpdates(id, { limit, skip, sort: -1 });
  const total = await getReservationUpdateCount(id);

  res.status(200).json({
    total,
    page,
    pages: Math.ceil(total / limit),
    updates,
  });
});

// Get updates for all reservations (admin/cashier only)
export const getAllReservationUpdates = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;
  const reservationId = req.query.reservationId; // Optional filter
  const updateType = req.query.updateType; // Optional filter

  const ReservationUpdate = (await import("../models/ReservationUpdate.js")).default;

  // Build query
  const filter = {};
  if (reservationId) {
    filter.reservationId = reservationId;
  }
  if (updateType) {
    filter.updateType = updateType;
  }

  const updates = await ReservationUpdate.find(filter)
    .populate("reservationId", "status totalPrice reservationDate")
    .populate("updatedBy", "name email roles")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await ReservationUpdate.countDocuments(filter);

  res.status(200).json({
    total,
    page,
    pages: Math.ceil(total / limit),
    updates,
  });
});
