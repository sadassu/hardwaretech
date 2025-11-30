import User from "../models/User.js";
import Reservation from "../models/Reservation.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Delete account controller
export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.params.id || req.user._id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (req.params.id && req.user.roles[0] !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Only admins can delete other users" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Preserve reservations by setting userId to null but keeping userName and userEmail
  // Only update reservations that don't already have stored user info
  await Reservation.updateMany(
    { 
      userId: userId,
      $or: [
        { userName: { $exists: false } },
        { userName: null },
        { userEmail: { $exists: false } },
        { userEmail: null }
      ]
    },
    {
      $set: {
        userId: null,
        userName: user.name,
        userEmail: user.email,
      }
    }
  );

  // For reservations that already have stored user info, just set userId to null
  await Reservation.updateMany(
    { 
      userId: userId,
      userName: { $exists: true, $ne: null },
      userEmail: { $exists: true, $ne: null }
    },
    {
      $set: {
        userId: null,
      }
    }
  );

  await User.findByIdAndDelete(userId);

  if (userId.toString() === req.user._id.toString()) {
    res.clearCookie("token");
  }

  res.status(200).json({ message: "Account deleted successfully" });
});
