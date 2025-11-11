import express from "express";
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReviewById,
  updateReview,
} from "../controllers/reviewController.js";
import { verifyToken, verifyRole } from "../middleware/auth.js";

const reviewRouter = express.Router();

// All review routes require authentication
// Customers can create reviews
// Artists can view their reviews
// Admins can manage all reviews

// Get all reviews - Public (can be viewed by anyone, but protected for consistency)
reviewRouter.get("/", verifyToken, verifyRole("Admin", "Super Admin", "Customer", "Artist"), getAllReviews);

// Get review by ID - Public (can be viewed by anyone)
reviewRouter.get("/:id", verifyToken, verifyRole("Admin", "Super Admin", "Customer", "Artist"), getReviewById);

// Create review - Customer and Admin
reviewRouter.post("/", verifyToken, verifyRole("Customer", "Admin", "Super Admin"), createReview);

// Update review - Customer (own reviews) and Admin
reviewRouter.put("/:id", verifyToken, verifyRole("Customer", "Admin", "Super Admin"), updateReview);

// Delete review - Customer (own reviews) and Admin
reviewRouter.delete("/:id", verifyToken, verifyRole("Customer", "Admin", "Super Admin"), deleteReview);

export default reviewRouter;
