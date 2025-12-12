import express from "express";
import {
  createBooking,
  getBookingById,
  updateBookingStatus,
  completeBooking,
  getBookings,
} from "../controllers/bookingController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", createBooking);
router.get("/", getBookings);
router.get("/:id", getBookingById);
router.patch("/:id/status", updateBookingStatus);
router.post("/:id/complete", completeBooking);

export default router;
