/**
 * Customers Routes (Entity-based)
 * Routes for customer profile management, bookings, and reviews
 */
import express from "express";
import {
  getProfile,
  updateProfile,
  getBookings,
  getReviews,
  getFavorites,
  toggleFavorite,
} from "../controllers/customerController.js";
import { verifyToken, checkApproval } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Customer-only routes - Profile management
router.get(
  "/profile",
  verifyToken,
  requireRole("customer"),
  checkApproval,
  getProfile
);
router.put(
  "/profile",
  verifyToken,
  requireRole("customer"),
  checkApproval,
  updateProfile
);

// Customer-only routes - Bookings
router.get(
  "/bookings",
  verifyToken,
  requireRole("customer"),
  checkApproval,
  getBookings
);

// Customer-only routes - Reviews
router.get(
  "/reviews",
  verifyToken,
  requireRole("customer"),
  checkApproval,
  getReviews
);

// Customer-only routes - Favorites
router.get(
  "/favorites",
  verifyToken,
  requireRole("customer"),
  checkApproval,
  getFavorites
);
router.post(
  "/favorites",
  verifyToken,
  requireRole("customer"),
  checkApproval,
  toggleFavorite
);

export default router;

