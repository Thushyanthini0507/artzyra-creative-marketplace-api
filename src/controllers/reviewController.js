/**
 * Review Controller
 * Handles review creation, retrieval, updates, and deletion
 */
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Artist from "../models/Artist.js";
import { createNotification } from "../utils/helpers.js";
import Notification from "../models/Notification.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../utils/errors.js";
import { asyncHandler } from "../middleware/authMiddleware.js";
import { formatPaginationResponse } from "../utils/paginate.js";

/**
 * Create review
 * @route POST /api/reviews
 */
export const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating) {
    throw new BadRequestError("Please provide bookingId and rating");
  }

  if (rating < 1 || rating > 5) {
    throw new BadRequestError("Rating must be between 1 and 5");
  }

  // Check if booking exists and belongs to customer
  const booking = await Booking.findById(bookingId)
    .populate("customer", "name")
    .populate("artist", "name");

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.customer._id.toString() !== req.userId.toString()) {
    throw new ForbiddenError("You can only review your own bookings");
  }

  if (booking.status !== "completed") {
    throw new BadRequestError("You can only review completed bookings");
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ booking: bookingId });
  if (existingReview) {
    throw new BadRequestError("Review already exists for this booking");
  }

  // Create review
  const review = await Review.create({
    booking: bookingId,
    customer: req.userId,
    artist: booking.artist._id,
    rating,
    comment,
  });

  // Update artist rating
  const artist = await Artist.findById(booking.artist._id);
  const totalReviews = await Review.countDocuments({ artist: artist._id });
  const avgRating = await Review.aggregate([
    { $match: { artist: artist._id } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);

  artist.rating = avgRating[0]?.avgRating || rating;
  artist.totalReviews = totalReviews;
  await artist.save();

  const populatedReview = await Review.findById(review._id)
    .populate("customer", "name profileImage")
    .populate("artist", "name profileImage")
    .populate("booking", "bookingDate startTime endTime");

  // Create notification for artist
  await createNotification(
    Notification,
    booking.artist._id,
    "Artist",
    "review_received",
    "New Review Received",
    `You received a ${rating}-star review from ${booking.customer.name}`,
    review._id,
    "Review"
  );

  res.status(201).json({
    success: true,
    message: "Review created successfully",
    data: {
      review: populatedReview,
    },
  });
});

/**
 * Get reviews by artist with pagination
 * @route GET /api/reviews/artist/:artistId
 */
export const getReviewsByArtist = asyncHandler(async (req, res) => {
  const { artistId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  const reviews = await Review.find({ artist: artistId, isVisible: true })
    .populate("customer", "name profileImage")
    .populate("booking", "bookingDate startTime endTime")
    .skip(skip)
    .limit(limitNum)
    .sort({ createdAt: -1 });

  const total = await Review.countDocuments({
    artist: artistId,
    isVisible: true,
  });

  const response = formatPaginationResponse(reviews, total, page, limit);

  res.json({
    success: true,
    data: response.data,
    pagination: response.pagination,
  });
});

/**
 * Get review by ID
 * @route GET /api/reviews/:reviewId
 */
export const getReviewById = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId)
    .populate("customer", "name profileImage")
    .populate("artist", "name profileImage category")
    .populate("booking", "bookingDate startTime endTime");

  if (!review) {
    throw new NotFoundError("Review not found");
  }

  res.json({
    success: true,
    data: {
      review,
    },
  });
});

/**
 * Update review
 * @route PUT /api/reviews/:reviewId
 */
export const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(reviewId)
    .populate("artist", "_id");

  if (!review) {
    throw new NotFoundError("Review not found");
  }

  if (review.customer.toString() !== req.userId.toString()) {
    throw new ForbiddenError("You can only update your own reviews");
  }

  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestError("Rating must be between 1 and 5");
    }
    review.rating = rating;
  }

  if (comment !== undefined) {
    review.comment = comment;
  }

  await review.save();

  // Update artist rating
  const artist = await Artist.findById(review.artist._id);
  const avgRating = await Review.aggregate([
    { $match: { artist: artist._id } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);

  artist.rating = avgRating[0]?.avgRating || artist.rating;
  await artist.save();

  const updatedReview = await Review.findById(reviewId)
    .populate("customer", "name profileImage")
    .populate("artist", "name profileImage")
    .populate("booking", "bookingDate");

  res.json({
    success: true,
    message: "Review updated successfully",
    data: {
      review: updatedReview,
    },
  });
});

/**
 * Delete review
 * @route DELETE /api/reviews/:reviewId
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId)
    .populate("artist", "_id");

  if (!review) {
    throw new NotFoundError("Review not found");
  }

  if (
    review.customer.toString() !== req.userId.toString() &&
    req.userRole !== "admin"
  ) {
    throw new ForbiddenError(
      "You are not authorized to delete this review"
    );
  }

  const artistId = review.artist._id;

  await Review.findByIdAndDelete(reviewId);

  // Update artist rating
  const artist = await Artist.findById(artistId);
  const totalReviews = await Review.countDocuments({ artist: artistId });
  const avgRating = await Review.aggregate([
    { $match: { artist: artistId } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);

  artist.rating = totalReviews > 0 ? avgRating[0]?.avgRating || 0 : 0;
  artist.totalReviews = totalReviews;
  await artist.save();

  res.json({
    success: true,
    message: "Review deleted successfully",
  });
});
