import express from "express";
import {
  createBooking,
  getBookingById,
  updateBookingStatus,
  completeBooking,
  getBookings,
  requestRevision,
  approveBooking,
  cancelBooking,
  approveCustomQuote,
  setCustomQuote,
  checkArtistAvailability,
  getAllBookingsAdmin,
  adminForceCancel,
  adminProcessRefund,
  adminResolveDispute,
  getArtistPerformance,
} from "../controllers/bookingController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyToken);

// Public booking routes
router.get("/check-availability/:artistId", checkArtistAvailability);

// Customer/Artist booking routes
router.post("/", createBooking);
router.get("/", getBookings);
router.get("/:id", getBookingById);
router.patch("/:id/status", updateBookingStatus);
router.post("/:id/complete", completeBooking);
router.post("/:id/revision", requestRevision);
router.post("/:id/approve", approveBooking);
router.post("/:id/cancel", cancelBooking);
router.post("/:id/approve-quote", approveCustomQuote);
router.post("/:id/set-quote", setCustomQuote);

// Admin routes
router.get("/admin/all", requireRole("admin"), getAllBookingsAdmin);
router.post("/:id/admin/cancel", requireRole("admin"), adminForceCancel);
router.post("/:id/admin/refund", requireRole("admin"), adminProcessRefund);
router.post("/:id/admin/resolve-dispute", requireRole("admin"), adminResolveDispute);
router.get("/admin/artist-performance/:artistId", requireRole("admin"), getArtistPerformance);

export default router;
