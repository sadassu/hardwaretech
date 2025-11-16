import Reservation from "../src/models/Reservation.js";

export default async function handler(req, res) {
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

    res.json({
      message: `Auto-cancelled ${result.modifiedCount} confirmed reservations`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
