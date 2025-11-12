/**
 * Authentication Routes
 * Public routes for login
 * Protected routes for user profile management
 */
import express from "express";
import {
  login,
  getMe,
  logout,
} from "../controllers/authController.js";
import { authenticate, checkApproval } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", login);

// Protected routes
router.get("/me", authenticate, checkApproval, getMe);
router.post("/logout", authenticate, checkApproval, logout);

export default router;
