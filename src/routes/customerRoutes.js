import express from "express";
import {
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
} from "../controllers/customerController.js";
import {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getMeCustomer,
  updateCustomerPassword,
} from "../controllers/customerAuthController.js";
import { verifyToken, verifyRole } from "../middleware/auth.js";

const customerRouter = express.Router();

// Public routes - Authentication
customerRouter.post("/register", registerCustomer);
customerRouter.post("/login", loginCustomer);

// Protected routes - Customer profile management
customerRouter.post(
  "/logout",
  verifyToken,
  verifyRole("Customer"),
  logoutCustomer
);
customerRouter.get("/me", verifyToken, verifyRole("Customer"), getMeCustomer);
customerRouter.put(
  "/updatepassword",
  verifyToken,
  verifyRole("Customer"),
  updateCustomerPassword
);

// Admin only routes - Customer management
customerRouter.get(
  "/", getAllCustomers
);
customerRouter.get(
  "/:id",
  verifyToken,
  verifyRole("Admin", "Super Admin", "Customer"),
  getCustomerById
);
customerRouter.post(
  "/",
  verifyToken,
  verifyRole("Admin", "Super Admin"),
  createCustomer
);
customerRouter.put(
  "/:id",
  verifyToken,
  verifyRole("Admin", "Super Admin", "Customer"),
  updateCustomer
);
customerRouter.delete(
  "/:id",
  verifyToken,
  verifyRole("Admin", "Super Admin"),
  deleteCustomer
);

export default customerRouter;
