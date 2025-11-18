/**
 * Payment Controller
 * Handles payment processing, retrieval, and refunds
 */
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import {
  processPayment,
  refundPayment,
  verifyPayment,
} from "../utils/paymentService.js";
import { createNotification } from "../utils/helpers.js";
import Notification from "../models/Notification.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../utils/errors.js";
import { asyncHandler } from "../middleware/authMiddleware.js";

/**
 * Create payment
 * @route POST /api/payments
 */
export const createPayment = asyncHandler(async (req, res) => {
  const { bookingId, paymentMethod } = req.body;

  if (!bookingId || !paymentMethod) {
    throw new BadRequestError(
      "Please provide bookingId and paymentMethod"
    );
  }

  const booking = await Booking.findById(bookingId)
    .populate("customer", "name email")
    .populate("artist", "name email");

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Check authorization
  if (booking.customer._id.toString() !== req.userId.toString()) {
    throw new ForbiddenError(
      "You are not authorized to make payment for this booking"
    );
  }

  if (booking.paymentStatus === "paid") {
    throw new BadRequestError(
      "Payment already completed for this booking"
    );
  }

  // Process payment
  const paymentResult = await processPayment({
    bookingId: booking._id,
    customerId: booking.customer._id,
    artistId: booking.artist._id,
    amount: booking.totalAmount,
    currency: "USD",
    paymentMethodId: paymentMethod,
  });

  if (!paymentResult.success) {
    throw new BadRequestError(
      `Payment processing failed: ${paymentResult.error}`
    );
  }

  // Create payment record
  const payment = await Payment.create({
    booking: bookingId,
    customer: booking.customer._id,
    artist: booking.artist._id,
    amount: booking.totalAmount,
    currency: "USD",
    paymentMethod,
    transactionId: paymentResult.transactionId,
    status: paymentResult.status === "completed" ? "completed" : "pending",
    paymentDate: new Date(),
  });

  // Update booking payment status
  booking.paymentStatus =
    paymentResult.status === "completed" ? "paid" : "pending";
  booking.payment = payment._id;
  await booking.save();

  // Create notification for artist
  await createNotification(
    Notification,
    booking.artist._id,
    "Artist",
    "payment_received",
    "Payment Received",
    `Payment received for booking. Amount: $${booking.totalAmount}`,
    payment._id,
    "Payment"
  );

  const populatedPayment = await Payment.findById(payment._id)
    .populate("booking", "bookingDate startTime endTime")
    .populate("customer", "name email")
    .populate("artist", "name email");

  res.status(201).json({
    success: true,
    message: "Payment processed successfully",
    data: {
      payment: populatedPayment,
    },
  });
});

/**
 * Get payment by ID
 * @route GET /api/payments/:paymentId
 */
export const getPaymentById = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId)
    .populate("booking", "bookingDate startTime endTime totalAmount")
    .populate("customer", "name email phone")
    .populate("artist", "name email");

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  // Check authorization
  const isAuthorized =
    payment.customer._id.toString() === req.userId.toString() ||
    payment.artist._id.toString() === req.userId.toString() ||
    req.userRole === "admin";

  if (!isAuthorized) {
    throw new ForbiddenError(
      "You are not authorized to view this payment"
    );
  }

  res.json({
    success: true,
    data: {
      payment,
    },
  });
});

/**
 * Get payments
 * @route GET /api/payments
 */
export const getPayments = asyncHandler(async (req, res) => {
  const query = {};

  // Role-based filtering
  if (req.userRole === "customer") {
    query.customer = req.userId;
  } else if (req.userRole === "artist") {
    query.artist = req.userId;
  } else if (req.userRole !== "admin") {
    throw new ForbiddenError("Unauthorized");
  }

  const payments = await Payment.find(query)
    .populate("booking", "bookingDate startTime endTime totalAmount")
    .populate("customer", "name email")
    .populate("artist", "name email")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: payments,
  });
});

/**
 * Refund payment (Admin only)
 * @route POST /api/payments/:paymentId/refund
 */
export const refundPaymentRequest = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { amount } = req.body;

  const payment = await Payment.findById(paymentId)
    .populate("booking")
    .populate("customer", "name email")
    .populate("artist", "name email");

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  // Only admin can process refunds
  if (req.userRole !== "admin") {
    throw new ForbiddenError("Only admins can process refunds");
  }

  if (payment.status !== "completed") {
    throw new BadRequestError("Only completed payments can be refunded");
  }

  const refundAmount = amount || payment.amount;
  const refundResult = await refundPayment(
    payment.transactionId,
    refundAmount
  );

  if (!refundResult.success) {
    throw new BadRequestError(
      `Refund processing failed: ${refundResult.error}`
    );
  }

  payment.status = "refunded";
  await payment.save();

  // Update booking payment status
  if (payment.booking) {
    payment.booking.paymentStatus = "refunded";
    await payment.booking.save();
  }

  // Create notification
  await createNotification(
    Notification,
    payment.customer._id,
    "Customer",
    "system",
    "Payment Refunded",
    `Your payment of $${refundAmount} has been refunded.`,
    payment._id,
    "Payment"
  );

  res.json({
    success: true,
    message: "Refund processed successfully",
    data: {
      payment,
      refund: refundResult,
    },
  });
});
