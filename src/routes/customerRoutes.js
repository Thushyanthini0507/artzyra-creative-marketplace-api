/**
 * Customer Routes
 * All routes require authentication and customer role
 */
import express from "express";
import {
  getProfile,
  updateProfile,
  getBookings,
  getReviews,
} from "../controllers/customerController.js";
import { authenticate, checkApproval } from "../middleware/authMiddleware.js";
import { customerOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All customer routes require authentication, approval, and customer role
router.use(authenticate);
router.use(checkApproval);
router.use(customerOnly);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/bookings", getBookings);
router.get("/reviews", getReviews);

export default router;
