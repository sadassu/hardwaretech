import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
