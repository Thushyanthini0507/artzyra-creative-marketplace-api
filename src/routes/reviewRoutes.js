/**
 * Review Routes
 * Public routes for viewing reviews
 * Protected routes for creating and managing reviews
 */
import express from "express";
import {
  createReview,
  getReviewsByArtist,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { authenticate, checkApproval, asyncHandler } from "../middleware/authMiddleware.js";
import { customerOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public routes - View reviews (no authentication required)
router.get("/artist/:artistId", getReviewsByArtist);
router.get("/:reviewId", getReviewById);

// Protected routes - Create and manage reviews
router.post(
  "/",
  authenticate,
  checkApproval,
  customerOnly,
  createReview
);

router.put(
  "/:reviewId",
  authenticate,
  checkApproval,
  customerOnly,
  updateReview
);

// Delete review (customer or admin)
router.delete(
  "/:reviewId",
  authenticate,
  checkApproval,
  asyncHandler(async (req, res, next) => {
    // Allow customer or admin to delete
    if (req.userRole !== "customer" && req.userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    next();
  }),
  deleteReview
);

export default router;
