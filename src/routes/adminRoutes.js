import express from "express";
import {
  getDashboardStats,
  getSystemStats,
  approveArtist,
  rejectArtist,
  deleteReviewAdmin,
  updateBookingStatus,
  getPendingApprovals,
  getAllUsersAdmin,
  getRevenueAnalytics,
} from "../controllers/adminController.js";
import { verifyToken, verifyRole } from "../middleware/auth.js";

const adminRouter = express.Router();

// All admin routes require authentication and Admin role
adminRouter.use(verifyToken);
adminRouter.use(verifyRole("Admin", "Super Admin"));

// Dashboard routes
adminRouter.get("/dashboard", getDashboardStats);
adminRouter.get("/stats", getSystemStats);
adminRouter.get("/analytics/revenue", getRevenueAnalytics);

// User management
adminRouter.get("/users", getAllUsersAdmin);

// Artist management
adminRouter.get("/approvals", getPendingApprovals);
adminRouter.put("/artists/:id/approve", approveArtist);
adminRouter.put("/artists/:id/reject", rejectArtist);

// Booking management
adminRouter.put("/bookings/:id/status", updateBookingStatus);

// Review management (remove inappropriate content)
adminRouter.delete("/reviews/:id", deleteReviewAdmin);

export default adminRouter;

