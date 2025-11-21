import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import {
  changeName,
  changePassword,
  // uploadAvatar, // ❌ Disabled - users cannot change profile photo
} from "../controllers/profileController.js";
// import upload from "../middleware/upload.js"; // ❌ Disabled

const router = express.Router();

router.put("/:id/change-name", requireAuth, changeName);
router.put("/:id/change-password", requireAuth, changePassword);
// ❌ Avatar upload route disabled - users cannot change profile photo
// router.post("/:id/avatar", requireAuth, upload.single("avatar"), uploadAvatar);

export default router;
