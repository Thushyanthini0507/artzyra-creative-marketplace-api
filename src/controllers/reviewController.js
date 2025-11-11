import Review from "../models/review.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { NotFoundError } from "../utils/errors.js";

// Get all reviews with populated customer and artist
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate("customer_id", "name email phone")
    .populate("talent_id", "name category email rating");

  res.status(200).json({
    success: true,
    length: reviews.length,
    reviews,
  });
});

// Get a review by Id with populated data
export const getReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id)
    .populate("customer_id", "name email phone address")
    .populate("talent_id", "name category email bio rating");

  if (!review) {
    throw new NotFoundError("Review");
  }

  res.status(200).json({
    success: true,
    review,
  });
});

// Create a review
export const createReview = asyncHandler(async (req, res) => {
  const reviewData = req.body;
  const newReview = new Review(reviewData);
  const savedReview = await newReview.save();
  
  // Populate after save
  await savedReview.populate("customer_id", "name email");
  await savedReview.populate("talent_id", "name category");

  res.status(201).json({
    success: true,
    message: "Review created successfully",
    review: savedReview,
  });
});

// Update a review by Id
export const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const review = await Review.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate("customer_id", "name email")
    .populate("talent_id", "name category");

  if (!review) {
    throw new NotFoundError("Review");
  }

  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    review,
  });
});

// Delete a review by Id
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findByIdAndDelete(id);

  if (!review) {
    throw new NotFoundError("Review");
  }

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
    deletedReview: review,
  });
});
