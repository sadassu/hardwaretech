import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import {
  changeName,
  changePassword,
} from "../controllers/profileController.js";

const router = express.Router();

router.put("/:id/change-name", requireAuth, changeName);
router.put("/:id/change-password", requireAuth, changePassword);

export default router;
