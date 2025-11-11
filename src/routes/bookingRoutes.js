import express from "express";
import {
  createBooking,
  deleteBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
} from "../controllers/bookingController.js";
import { verifyToken, verifyRole } from "../middleware/auth.js";

const bookingRouter = express.Router();

// All booking routes require authentication
// Admins can manage all bookings
// Customers can create and view their own bookings
// Artists can view and update their own bookings

// Get all bookings - Admin only
bookingRouter.get(
  "/",
  verifyToken,
  verifyRole("Admin", "Super Admin", "Customer", "Artist"),
  getAllBookings
);

// Get booking by ID - Admin, Customer (own bookings), Artist (own bookings)
bookingRouter.get("/:id", verifyToken, verifyRole("Admin", "Super Admin", "Artist"), getBookingById);

// Create booking - Customer and Admin
bookingRouter.post("/", verifyToken, verifyRole("Customer", "Admin", "Super Admin"), createBooking);

// Update booking - Admin, Customer (own bookings), Artist (own bookings)
bookingRouter.put("/:id", verifyToken, verifyRole("Admin", "Super Admin", "Customer", "Artist"), updateBooking);

// Delete booking - Admin only
bookingRouter.delete("/:id", verifyToken, verifyRole("Admin", "Super Admin"), deleteBooking);

export default bookingRouter;
