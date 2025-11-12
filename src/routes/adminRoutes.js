/**
 * Admin Routes
 * All routes require authentication, approval, and admin role
 */
import express from "express";
import {
  approveUser,
  getUsersByRole,
  getUserById,
  getAllBookings,
  getDashboardStats,
} from "../controllers/adminController.js";
import { authenticate, checkApproval } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All admin routes require authentication, approval, and admin role
router.use(authenticate);
router.use(checkApproval);
router.use(adminOnly);

router.post("/users/approve", approveUser);
router.get("/users", getUsersByRole);
router.get("/users/:role/:userId", getUserById);
router.get("/bookings", getAllBookings);
router.get("/dashboard/stats", getDashboardStats);

export default router;
