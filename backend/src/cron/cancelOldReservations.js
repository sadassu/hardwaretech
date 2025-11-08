import cron from "node-cron";
import Reservation from "../models/Reservation.js"; 

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  const now = new Date();
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(now.getDate() - 3);

  try {
    const result = await Reservation.updateMany(
      {
        status: "confirmed",
        reservationDate: { $lte: threeDaysAgo },
      },
      {
        $set: { status: "cancelled", remarks: "Auto-cancelled after 3 days" },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[CRON] Auto-cancelled ${result.modifiedCount} confirmed reservations older than 3 days`
      );
    } else {
      console.log("[CRON] No old confirmed reservations found to cancel");
    }
  } catch (err) {
    console.error("[CRON] Error auto-cancelling old reservations:", err);
  }
});

console.log(
  "✅ Cron job scheduled: Auto-cancel reservations at midnight daily"
);
