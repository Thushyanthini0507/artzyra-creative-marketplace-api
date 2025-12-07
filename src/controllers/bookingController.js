/**
 * Booking Controller
 * Handles booking creation, management, and status updates
 */
import Booking from "../models/Booking.js";
import Artist from "../models/Artist.js";
import Payment from "../models/Payment.js";
import {
  calculateBookingAmount,
  isTimeSlotAvailable,
  createNotification,
} from "../utils/helpers.js";
import Notification from "../models/Notification.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../utils/errors.js";
import { asyncHandler } from "../middleware/authMiddleware.js";
import { formatPaginationResponse } from "../utils/paginate.js";

/**
 * Create booking
 * @route POST /api/bookings
 */
export const createBooking = asyncHandler(async (req, res) => {
  const {
    artistId,
    categoryId,
    bookingDate,
    startTime,
    endTime,
    specialRequests,
    location,
  } = req.body;

  console.log("📥 Booking request body:", req.body);
  console.log("📥 User ID:", req.userId);

  // Validate required fields
  if (!artistId || !categoryId || !bookingDate || !startTime || !endTime) {
    const missingFields = [];
    if (!artistId) missingFields.push("artistId");
    if (!categoryId) missingFields.push("categoryId");
    if (!bookingDate) missingFields.push("bookingDate");
    if (!startTime) missingFields.push("startTime");
    if (!endTime) missingFields.push("endTime");
    throw new BadRequestError(`Please provide all required fields. Missing: ${missingFields.join(", ")}`);
  }

  // Check if artist exists and is approved
  const artist = await Artist.findById(artistId).populate("category");
  if (!artist) {
    throw new NotFoundError("Artist not found");
  }

  if (artist.status !== "approved") {
    throw new BadRequestError("Artist is not available for booking");
  }

  // Check availability
  const available = isTimeSlotAvailable(
    artist.availability,
    bookingDate,
    startTime,
    endTime
  );
  if (!available) {
    throw new BadRequestError("Time slot is not available");
  }

  // Check for conflicting bookings
  const conflictingBooking = await Booking.findOne({
    artist: artistId,
    bookingDate: new Date(bookingDate),
    status: { $in: ["pending", "accepted"] },
    $or: [
      {
        startTime: { $lte: startTime },
        endTime: { $gte: startTime },
      },
      {
        startTime: { $lte: endTime },
        endTime: { $gte: endTime },
      },
    ],
  });

  if (conflictingBooking) {
    throw new BadRequestError("Time slot is already booked");
  }

  // Validate customer exists (req.userId should be set by auth middleware)
  if (!req.userId) {
    throw new BadRequestError("User authentication required");
  }

  // Calculate duration and amount
  const start = new Date(`${bookingDate}T${startTime}`);
  const end = new Date(`${bookingDate}T${endTime}`);
  const duration = (end - start) / (1000 * 60 * 60); // Convert to hours
  
  if (duration <= 0) {
    throw new BadRequestError("End time must be after start time");
  }
  
  const totalAmount = calculateBookingAmount(artist.hourlyRate, duration);

  // Create booking
  try {
    const booking = await Booking.create({
      customer: req.userId,
      artist: artistId,
      category: categoryId,
      bookingDate: new Date(bookingDate),
      startTime,
      endTime,
      duration,
      totalAmount,
      specialRequests: specialRequests || "",
      location: location || "",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("customer", "name email phone")
      .populate("artist", "name email phone profileImage rating category")
      .populate("category", "name description");

    // Create notification for artist
    await createNotification(
      Notification,
      artistId,
      "Artist",
      "booking_request",
      "New Booking Request",
      `You have a new booking request from ${req.user?.name || "a customer"}`,
      booking._id,
      "Booking"
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        booking: populatedBooking,
      },
    });
  } catch (dbError) {
    console.error("Database error creating booking:", dbError);
    if (dbError.name === "ValidationError") {
      const errors = Object.values(dbError.errors).map((val) => val.message);
      throw new BadRequestError(`Validation error: ${errors.join(", ")}`);
    }
    throw dbError;
  }
});

/**
 * Get booking by ID
 * @route GET /api/bookings/:bookingId
 */
export const getBookingById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId)
    .populate("customer", "name email phone profileImage")
    .populate("artist", "name email phone profileImage rating category")
    .populate("category", "name description");

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Check authorization
  const isAuthorized =
    booking.customer._id.toString() === req.userId.toString() ||
    booking.artist._id.toString() === req.userId.toString() ||
    req.userRole === "admin";

  if (!isAuthorized) {
    throw new ForbiddenError(
      "You are not authorized to view this booking"
    );
  }

  res.json({
    success: true,
    data: {
      booking,
    },
  });
});

/**
 * Cancel booking
 * @route PUT /api/bookings/:bookingId/cancel
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId)
    .populate("customer", "name")
    .populate("artist", "name");

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Check authorization (customer can cancel their own bookings)
  if (
    booking.customer._id.toString() !== req.userId.toString() &&
    req.userRole !== "admin"
  ) {
    throw new ForbiddenError(
      "You are not authorized to cancel this booking"
    );
  }

  if (booking.status === "cancelled") {
    throw new BadRequestError("Booking is already cancelled");
  }

  if (booking.status === "completed") {
    throw new BadRequestError("Cannot cancel a completed booking");
  }

  booking.status = "cancelled";
  await booking.save();

  // Create notification for artist
  await createNotification(
    Notification,
    booking.artist._id,
    "Artist",
    "system",
    "Booking Cancelled",
    `A booking has been cancelled by ${booking.customer.name}.`,
    booking._id,
    "Booking"
  );

  res.json({
    success: true,
    message: "Booking cancelled successfully",
    data: {
      booking,
    },
  });
});

/**
 * Complete booking (for artist)
 * @route PUT /api/bookings/:bookingId/complete
 */
export const completeBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId)
    .populate("customer", "name email")
    .populate("artist", "name");

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Check authorization
  if (booking.artist._id.toString() !== req.userId.toString()) {
    throw new ForbiddenError(
      "You are not authorized to complete this booking"
    );
  }

  if (booking.status !== "accepted") {
    throw new BadRequestError("Only accepted bookings can be completed");
  }

  booking.status = "completed";
  await booking.save();

  // Create notification for customer
  await createNotification(
    Notification,
    booking.customer._id,
    "Customer",
    "booking_completed",
    "Booking Completed",
    `Your booking has been marked as completed. You can now leave a review.`,
    booking._id,
    "Booking"
  );

  res.json({
    success: true,
    message: "Booking completed successfully",
    data: {
      booking,
    },
  });
});
