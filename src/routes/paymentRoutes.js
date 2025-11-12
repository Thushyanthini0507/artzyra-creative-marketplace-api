/**
 * Payment Routes
 * Routes for payment processing and management
 */
import express from "express";
import {
  createPayment,
  getPaymentById,
  getPayments,
  refundPaymentRequest,
} from "../controllers/paymentController.js";
import { authenticate, checkApproval } from "../middleware/authMiddleware.js";
import { customerOnly, adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);
router.use(checkApproval);

// Create payment (customer only)
router.post("/", customerOnly, createPayment);

// Get payments (customer, artist, admin)
router.get("/", getPayments);

// Get payment by ID
router.get("/:paymentId", getPaymentById);

// Refund payment (admin only)
router.post("/:paymentId/refund", adminOnly, refundPaymentRequest);

export default router;
