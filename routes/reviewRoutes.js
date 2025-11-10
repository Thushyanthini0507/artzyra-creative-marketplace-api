import express from "express";
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReviewById,
  updateReview,
} from "../controllers/reviewController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const reviewRouter = express.Router();

// All review routes require admin access
reviewRouter.get("/", protect, adminOnly, getAllReviews);
reviewRouter.get("/:id", protect, adminOnly, getReviewById);
reviewRouter.post("/", protect, adminOnly, createReview);
reviewRouter.put("/:id", protect, adminOnly, updateReview);
reviewRouter.delete("/:id", protect, adminOnly, deleteReview);

export default reviewRouter;
