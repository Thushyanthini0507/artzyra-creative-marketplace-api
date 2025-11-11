import express from "express";
import {
  createPayment,
  deletePayment,
  getAllPayment,
  getPaymentById,
  updatePayment,
} from "../controllers/paymentController.js";
import { verifyToken, verifyRole } from "../middleware/auth.js";

const PaymentRouter = express.Router();

// All payment routes require authentication
// Admins can manage all payments
// Customers can view their own payments

// Get all payments - Admin only
PaymentRouter.get("/", verifyToken, verifyRole("Admin", "Super Admin"), getAllPayment);

// Get payment by ID - Admin and Customer (own payments)
PaymentRouter.get("/:id", verifyToken, verifyRole("Admin", "Super Admin", "Customer"), getPaymentById);

// Create payment - Admin and Customer
PaymentRouter.post("/", verifyToken, verifyRole("Admin", "Super Admin", "Customer"), createPayment);

// Update payment - Admin only
PaymentRouter.put("/:id", verifyToken, verifyRole("Admin", "Super Admin"), updatePayment);

// Delete payment - Admin only
PaymentRouter.delete("/:id", verifyToken, verifyRole("Admin", "Super Admin"), deletePayment);

export default PaymentRouter;
