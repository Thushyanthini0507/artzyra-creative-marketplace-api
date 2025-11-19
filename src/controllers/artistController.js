/**
 * Artist Controller
 * Handles artist profile management, bookings, reviews, and availability
 */
import Artist from "../models/Artist.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import Category from "../models/Category.js";
import { isTimeSlotAvailable, createNotification } from "../utils/helpers.js";
import Notification from "../models/Notification.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../utils/errors.js";
import { asyncHandler } from "../middleware/authMiddleware.js";
import { formatPaginationResponse } from "../utils/paginate.js";

/**
 * Get artist profile
 * @route GET /api/artist/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const artist = await Artist.findById(req.userId)
    .populate("category", "name description image")
    .select("-password");

  if (!artist) {
    throw new NotFoundError("Artist not found");
  }

  res.json({
    success: true,
    data: {
      artist,
    },
  });
});

/**
 * Update artist profile
 * @route PUT /api/artist/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    bio,
    category,
    skills,
    hourlyRate,
    availability,
    profileImage,
  } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (bio !== undefined) updateData.bio = bio;
  if (category) updateData.category = category;
  if (skills) updateData.skills = skills;
  if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
  if (availability) updateData.availability = availability;
  if (profileImage !== undefined) updateData.profileImage = profileImage;

  const artist = await Artist.findByIdAndUpdate(req.userId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("category", "name description image")
    .select("-password");

  if (!artist) {
    throw new NotFoundError("Artist not found");
  }

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      artist,
    },
  });
});

/**
 * Get artist bookings with search and filtering
 * @route GET /api/artist/bookings
 * Query params: search, status, paymentStatus, category, startDate, endDate, minAmount, maxAmount, page, limit, sortBy, sortOrder
 * 
 * EXPLANATION:
 * Same filtering logic as customer bookings but filtered by artist ID instead of customer ID
 */
export const getBookings = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    paymentStatus,
    category,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    page = 1,
    limit = 10,
    sortBy = "bookingDate",
    sortOrder = "desc",
  } = req.query;

  // Base query - only get bookings for this artist
  const query = { artist: req.userId };

  // STATUS FILTERS
  if (status) {
    query.status = status;
  }
  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }
  if (category) {
    query.category = category;
  }

  // DATE RANGE FILTER
  if (startDate || endDate) {
    query.bookingDate = {};
    if (startDate) {
      query.bookingDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.bookingDate.$lte = new Date(endDate);
    }
  }

  // AMOUNT RANGE FILTER
  if (minAmount || maxAmount) {
    query.totalAmount = {};
    if (minAmount) {
      query.totalAmount.$gte = parseFloat(minAmount);
    }
    if (maxAmount) {
      query.totalAmount.$lte = parseFloat(maxAmount);
    }
  }

  // SEARCH FILTER
  if (search) {
    query.$or = [
      { location: { $regex: search, $options: "i" } },
      { specialRequests: { $regex: search, $options: "i" } },
    ];
  }

  // PAGINATION AND SORTING
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const bookings = await Booking.find(query)
    .populate("customer", "name email phone profileImage")
    .populate("category", "name description")
    .skip(skip)
    .limit(limitNum)
    .sort(sort);

  const total = await Booking.countDocuments(query);

  const response = formatPaginationResponse(bookings, total, page, limit);

  res.json({
    success: true,
    data: response.data,
    pagination: response.pagination,
  });
});

/**
 * Accept booking
 * @route PUT /api/artist/bookings/:bookingId/accept
 */
export const acceptBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId)
    .populate("customer", "name email")
    .populate("artist", "name");

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Check authorization
  if (booking.artist._id.toString() !== req.userId.toString()) {
    throw new ForbiddenError("You are not authorized to accept this booking");
  }

  if (booking.status !== "pending") {
    throw new BadRequestError(`Booking is already ${booking.status}`);
  }

  booking.status = "accepted";
  await booking.save();

  // Create notification for customer
  await createNotification(
    Notification,
    booking.customer._id,
    "Customer",
    "booking_accepted",
    "Booking Accepted",
    `Your booking has been accepted by ${booking.artist.name}.`,
    booking._id,
    "Booking"
  );

  res.json({
    success: true,
    message: "Booking accepted successfully",
    data: {
      booking,
    },
  });
});

/**
 * Reject booking
 * @route PUT /api/artist/bookings/:bookingId/reject
 */
export const rejectBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;

  const booking = await Booking.findById(bookingId)
    .populate("customer", "name email")
    .populate("artist", "name");

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Check authorization
  if (booking.artist._id.toString() !== req.userId.toString()) {
    throw new ForbiddenError("You are not authorized to reject this booking");
  }

  if (booking.status !== "pending") {
    throw new BadRequestError(`Booking is already ${booking.status}`);
  }

  booking.status = "rejected";
  await booking.save();

  // Create notification for customer
  await createNotification(
    Notification,
    booking.customer._id,
    "Customer",
    "booking_rejected",
    "Booking Rejected",
    `Your booking has been rejected.${reason ? ` Reason: ${reason}` : ""}`,
    booking._id,
    "Booking"
  );

  res.json({
    success: true,
    message: "Booking rejected successfully",
    data: {
      booking,
    },
  });
});

/**
 * Check availability
 * @route GET /api/artist/availability
 */
export const checkAvailability = asyncHandler(async (req, res) => {
  const { date, startTime, endTime } = req.query;

  if (!date || !startTime || !endTime) {
    throw new BadRequestError("Please provide date, startTime, and endTime");
  }

  const artist = await Artist.findById(req.userId);
  if (!artist) {
    throw new NotFoundError("Artist not found");
  }

  const isAvailable = isTimeSlotAvailable(
    artist.availability,
    date,
    startTime,
    endTime
  );

  // Check for existing bookings
  const existingBooking = await Booking.findOne({
    artist: req.userId,
    bookingDate: new Date(date),
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

  const available = isAvailable && !existingBooking;

  res.json({
    success: true,
    data: {
      available,
      message: available
        ? "Time slot is available"
        : "Time slot is not available",
    },
  });
});

/**
 * Get artist reviews with search and filtering
 * @route GET /api/artist/reviews
 * Query params: search, minRating, maxRating, startDate, endDate, page, limit, sortBy, sortOrder
 * 
 * EXPLANATION:
 * Filters reviews for the logged-in artist with rating and date range filters
 */
export const getReviews = asyncHandler(async (req, res) => {
  const {
    search,
    minRating,
    maxRating,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Base query - only visible reviews for this artist
  const query = {
    artist: req.userId,
    isVisible: true,
  };

  // RATING RANGE FILTER
  if (minRating || maxRating) {
    query.rating = {};
    if (minRating) {
      query.rating.$gte = parseInt(minRating);
    }
    if (maxRating) {
      query.rating.$lte = parseInt(maxRating);
    }
  }

  // DATE RANGE FILTER
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  // SEARCH FILTER
  if (search) {
    query.comment = { $regex: search, $options: "i" };
  }

  // PAGINATION AND SORTING
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const reviews = await Review.find(query)
    .populate("customer", "name profileImage")
    .populate("booking", "bookingDate startTime endTime")
    .skip(skip)
    .limit(limitNum)
    .sort(sort);

  const total = await Review.countDocuments(query);

  const response = formatPaginationResponse(reviews, total, page, limit);

  res.json({
    success: true,
    data: response.data,
    pagination: response.pagination,
  });
});

/**
 * Get all pending artists (admin only)
 * @route GET /api/artists/pending
 */
export const getPendingArtists = asyncHandler(async (req, res) => {
  const pendingArtists = await Artist.find({ isApproved: false })
    .select("-password")
    .populate("category", "name description");

  res.json({
    success: true,
    message: "Pending artists retrieved successfully",
    data: pendingArtists,
  });
});

/**
 * Approve artist (admin only)
 * @route PUT /api/artists/approve/:id
 */
export const approveArtist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const artist = await Artist.findById(id).select("-password");
  if (!artist) {
    throw new NotFoundError("Artist not found");
  }

  if (artist.isApproved) {
    return res.json({
      success: true,
      message: "Artist is already approved",
      data: artist,
    });
  }

  artist.isApproved = true;
  artist.isActive = true;
  await artist.save();

  res.json({
    success: true,
    message: "Artist approved successfully",
    data: artist,
  });
});

/**
 * Reject artist (admin only)
 * @route DELETE /api/artists/reject/:id
 */
export const rejectArtist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const artist = await Artist.findById(id);
  if (!artist) {
    throw new NotFoundError("Artist not found");
  }

  await artist.deleteOne();

  res.json({
    success: true,
    message: "Artist rejected and removed successfully",
  });
});
