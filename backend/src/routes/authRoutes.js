import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
} from "../controllers/authController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes (require authentication)
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);

// Admin only routes
router.get("/users", authenticate, authorize("superadmin", "hospitalAdmin"), getAllUsers);

export default router;

