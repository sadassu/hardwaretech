import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import {
  changeName,
  changePassword,
  uploadAvatar,
} from "../controllers/profileController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.put("/:id/change-name", requireAuth, changeName);
router.put("/:id/change-password", requireAuth, changePassword);
router.post("/:id/avatar", upload.single("avatar"), uploadAvatar);

export default router;
