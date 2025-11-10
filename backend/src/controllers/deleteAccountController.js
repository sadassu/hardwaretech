import User from "../models/User.js";
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

  await User.findByIdAndDelete(userId);

  if (userId.toString() === req.user._id.toString()) {
    res.clearCookie("token");
  }

  res.status(200).json({ message: "Account deleted successfully" });
});
