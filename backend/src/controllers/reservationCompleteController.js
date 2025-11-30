import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import ReservationDetail from "../models/ReservationDetail.js";
import Sale from "../models/Sale.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ensureVariantStock } from "../utils/variantStock.js";
import { emitGlobalUpdate } from "../services/realtime.js";

export const completeReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amountPaid } = req.body;
  const cashierId = req.user._id;

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
        populate: {
          path: "product",
          populate: { path: "category" }
        },
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

      await ensureVariantStock({
        variant,
        requiredQuantity: detail.quantity,
        session,
      });

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

    const totalDue = reservation.totalPrice;
    const finalAmountPaid =
      typeof amountPaid === "number" ? Number(amountPaid) : totalDue;

    if (finalAmountPaid < totalDue) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Amount paid must cover the total reservation amount.",
      });
    }

    // 4️⃣ Build sale items using locked reservation prices
    const items = details.map((d) => {
      const lockedPrice =
        d.price !== undefined && d.price !== null
          ? d.price
          : d.productVariantId.price || 0;
      return {
        productVariantId: d.productVariantId._id,
        productName: d.productVariantId.product?.name || "Unknown Product", // Store product name directly
        categoryName: d.productVariantId.product?.category?.name || "", // Store category name for persistence
        size: d.productVariantId.size || "",
        unit: d.productVariantId.unit || "",
        color: d.productVariantId.color || "",
        quantity: d.quantity,
        price: lockedPrice,
        subtotal: lockedPrice * d.quantity,
      };
    });

    // 5️⃣ Create Sale document
    const sale = new Sale({
      items,
      amountPaid: finalAmountPaid,
      cashier: cashierId,
      type: "reservation",
    });

    await sale.save({ session });

    // 6️⃣ Update reservation status
    reservation.status = "completed";
    await reservation.save({ session });

    // ✅ Commit
    await session.commitTransaction();
    session.endSession();

    // ✅ Send email notification to user
    try {
      const populatedReservation = await Reservation.findById(id).populate("userId", "name email");
      
      if (populatedReservation.userId && populatedReservation.userId.email) {
        // Extract product information from already populated details
        const products = details.map(detail => ({
          name: detail.productVariantId?.product?.name || "Unknown Product",
          size: detail.productVariantId?.size || detail.size || "",
          unit: detail.productVariantId?.unit || detail.unit || "",
          quantity: detail.quantity || 1,
          price: detail.price ?? detail.productVariantId?.price ?? 0
        }));

        const { sendReservationCompletedEmail } = await import("../services/emailService.js");

        // Non-blocking: Send email asynchronously without waiting
        sendReservationCompletedEmail(
          populatedReservation.userId.email,
          populatedReservation.userId.name,
          {
            reservationId: populatedReservation._id.toString(),
            status: "completed",
            reservationDate: populatedReservation.reservationDate,
            totalPrice: populatedReservation.totalPrice,
            remarks: populatedReservation.remarks || "",
            products: products
          }
        ).then(() => {
        console.log(`✅ Completion email sent to ${populatedReservation.userId.email}`);
        });
      }
    } catch (emailError) {
      console.error("❌ Failed to send completion email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      message: "Reservation completed and sale recorded successfully",
      reservation,
      sale,
    });

    // ✅ Emit SSE update for fast notifications (after response is sent)
    // Include userId so frontend can filter updates for specific user
    const userId = reservation.userId?.toString() || reservation.userId?._id?.toString();
    emitGlobalUpdate({
      method: "PUT",
      path: `/api/reservations/${id}/complete`,
      statusCode: 200,
      topics: ["reservations", "sales"],
      reservationId: id,
      userId: userId,
      status: "completed",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction failed:", error);
    return res.status(500).json({ error: "Failed to complete reservation" });
  }
});
