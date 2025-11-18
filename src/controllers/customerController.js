/**
 * Customer Controller
 * Handles customer profile management, bookings, and reviews
 */
import Customer from "../models/Customer.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import { NotFoundError } from "../utils/errors.js";
import { asyncHandler } from "../middleware/authMiddleware.js";

/**
 * Get customer profile
 * @route GET /api/customer/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.userId).select("-password");

  if (!customer) {
    throw new NotFoundError("Customer not found");
  }

  res.json({
    success: true,
    data: {
      customer,
    },
  });
});

/**
 * Update customer profile
 * @route PUT /api/customer/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, profileImage } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (address) updateData.address = address;
  if (profileImage !== undefined) updateData.profileImage = profileImage;

  const customer = await Customer.findByIdAndUpdate(req.userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!customer) {
    throw new NotFoundError("Customer not found");
  }

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      customer,
    },
  });
});

/**
 * Get customer bookings
 * @route GET /api/customer/bookings
 */
export const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ customer: req.userId })
    .populate("artist", "name email phone profileImage rating category")
    .populate("category", "name description")
    .sort({ bookingDate: -1 });

  res.json({
    success: true,
    data: bookings,
  });
});

/**
 * Get customer reviews
 * @route GET /api/customer/reviews
 */
export const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ customer: req.userId })
    .populate("artist", "name profileImage category")
    .populate("booking", "bookingDate startTime endTime")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: reviews,
  });
});
