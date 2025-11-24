import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import ReservationDetail from "../models/ReservationDetail.js";
import Sale from "../models/Sale.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ensureVariantStock } from "../utils/variantStock.js";

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
        populate: { path: "product" },
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
          price: detail.productVariantId?.price || 0
        }));

        const { sendEmail } = await import("../utils/sendEmail.js");
        const { getReservationStatusEmailTemplate } = await import("../utils/emailTemplates.js");

        const emailHtml = getReservationStatusEmailTemplate(
          populatedReservation.userId.name,
          populatedReservation._id.toString(),
          "completed",
          populatedReservation.reservationDate,
          populatedReservation.totalPrice,
          populatedReservation.remarks || "",
          products
        );

        await sendEmail(
          populatedReservation.userId.email,
          "Reservation Completed - Hardware Tech",
          emailHtml
        );

        console.log(`✅ Completion email sent to ${populatedReservation.userId.email}`);
      }
    } catch (emailError) {
      console.error("❌ Failed to send completion email:", emailError);
      // Don't fail the request if email fails
    }

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
