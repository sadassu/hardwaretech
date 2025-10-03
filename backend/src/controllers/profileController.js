import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import dotenv from "dotenv";

dotenv.config();

export const changeName = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  let emptyFields = [];
  if (!name) emptyFields.push("name");

  if (emptyFields.length > 0) {
    return res.status(400).json({
      error: "Please fill in all required fields",
      emptyFields,
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = name;
  await user.save();

  res.status(200).json({
    message: "User updated successfully",
    user: {
      userId: user._id,
      name: user.name,
      email: user.email,
      token: req.user.token || undefined,
    },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { password, confirmPassword } = req.body;
  const userId = req.params.id;

  const user = await User.changePassword(userId, password, confirmPassword);

  res.status(201).json({
    userId: user._id,
    roles: user.roles,
    name: user.name,
    email: user.email,
    message: "Password changed successfully!",
  });
});

// Upload Avatar
export const uploadAvatar = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // ✅ Check if uploaded file is an image
  if (!req.file.mimetype.startsWith("image/")) {
    // Delete the bad upload immediately
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Only image files are allowed" });
  }

  const user = await User.findById(userId);
  if (!user) {
    // Delete the uploaded file since user doesn't exist
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ message: "User not found" });
  }

  // ✅ If user already has an avatar, delete the old file
  if (user.avatar) {
    try {
      const oldPath = user.avatar.replace(
        process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`,
        ""
      );
      const oldFile = path.join(process.cwd(), oldPath);
      if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile);
      }
    } catch (err) {
      console.error("Error deleting old avatar:", err.message);
    }
  }

  // ✅ Save FULL URL in DB
  const BASE_URL =
    process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`;
  user.avatar = `${BASE_URL}/uploads/${req.file.filename}`;
  await user.save();

  res.status(200).json({
    message: "Avatar uploaded successfully",
    user: {
      userId: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  });
});
