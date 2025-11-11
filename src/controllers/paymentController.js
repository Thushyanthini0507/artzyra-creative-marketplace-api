import Payment from "../models/Payment.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { NotFoundError } from "../utils/errors.js";

// Get all payments with populated customer
export const getAllPayment = asyncHandler(async (req, res) => {
  const payments = await Payment.find().populate(
    "customer_id",
    "name email phone address"
  );

  res.status(200).json({
    success: true,
    length: payments.length,
    payments,
  });
});

// Get a payment by Id with populated customer
export const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payment = await Payment.findById(id).populate(
    "customer_id",
    "name email phone address"
  );

  if (!payment) {
    throw new NotFoundError("Payment");
  }

  res.status(200).json({
    success: true,
    payment,
  });
});

// Create a payment
export const createPayment = asyncHandler(async (req, res) => {
  const paymentData = req.body;
  const newPayment = new Payment(paymentData);
  const savedPayment = await newPayment.save();

  // Populate after save
  await savedPayment.populate("customer_id", "name email phone");

  res.status(201).json({
    success: true,
    message: "Payment created successfully",
    payment: savedPayment,
  });
});

// Update a payment by Id
export const updatePayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const payment = await Payment.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("customer_id", "name email phone");

  if (!payment) {
    throw new NotFoundError("Payment");
  }

  res.status(200).json({
    success: true,
    message: "Payment updated successfully",
    payment,
  });
});

// Delete a payment by Id
export const deletePayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payment = await Payment.findByIdAndDelete(id);

  if (!payment) {
    throw new NotFoundError("Payment");
  }

  res.status(200).json({
    success: true,
    message: "Payment deleted successfully",
    deletedPayment: payment,
  });
});
