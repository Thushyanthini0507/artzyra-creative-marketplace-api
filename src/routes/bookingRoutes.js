/**
 * Booking Routes
 * Routes for booking management
 */
import express from "express";
import {
  createBooking,
  getBookingById,
  cancelBooking,
  completeBooking,
} from "../controllers/bookingController.js";
import { authenticate, checkApproval } from "../middleware/authMiddleware.js";
import { customerOnly, artistOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);
router.use(checkApproval);

// Create booking (customer only)
router.post("/", customerOnly, createBooking);

// Get booking by ID (customer, artist, admin)
router.get("/:bookingId", getBookingById);

// Cancel booking (customer only)
router.put("/:bookingId/cancel", customerOnly, cancelBooking);

// Complete booking (artist only)
router.put("/:bookingId/complete", artistOnly, completeBooking);

export default router;
