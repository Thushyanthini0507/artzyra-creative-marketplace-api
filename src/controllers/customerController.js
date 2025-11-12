/**
 * Customer Controller
 * Handles customer profile management, bookings, and reviews
 */
import Customer from "../models/Customer.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import { NotFoundError } from "../utils/errors.js";
import { asyncHandler } from "../middleware/authMiddleware.js";
import { formatPaginationResponse } from "../utils/paginate.js";

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
 * Get customer bookings with pagination
 * @route GET /api/customer/bookings
 */
export const getBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { customer: req.userId };
  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  const bookings = await Booking.find(query)
    .populate("artist", "name email phone profileImage rating category")
    .populate("category", "name description")
    .skip(skip)
    .limit(limitNum)
    .sort({ bookingDate: -1 });

  const total = await Booking.countDocuments(query);

  const response = formatPaginationResponse(bookings, total, page, limit);

  res.json({
    success: true,
    data: response.data,
    pagination: response.pagination,
  });
});

/**
 * Get customer reviews with pagination
 * @route GET /api/customer/reviews
 */
export const getReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  const reviews = await Review.find({ customer: req.userId })
    .populate("artist", "name profileImage category")
    .populate("booking", "bookingDate startTime endTime")
    .skip(skip)
    .limit(limitNum)
    .sort({ createdAt: -1 });

  const total = await Review.countDocuments({ customer: req.userId });

  const response = formatPaginationResponse(reviews, total, page, limit);

  res.json({
    success: true,
    data: response.data,
    pagination: response.pagination,
  });
});
