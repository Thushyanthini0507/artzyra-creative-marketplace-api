import Customer from "../models/Customer.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ConflictError,
} from "../utils/errors.js";

/**
 * @desc    Register new customer
 * @route   POST /api/customers/register
 * @access  Public
 */
export const registerCustomer = asyncHandler(async (req, res) => {
  const { customer_id, name, email, password, phone, address } = req.body;

  // Validation
  if (!customer_id || !name || !email || !password || !phone) {
    throw new BadRequestError("Please provide all required fields");
  }

  // Check if customer already exists
  const customerExists = await Customer.findOne({ email });
  if (customerExists) {
    throw new ConflictError("Customer already exists with this email");
  }

  // Check if customer_id already exists
  const customerIdExists = await Customer.findOne({ customer_id });
  if (customerIdExists) {
    throw new ConflictError("Customer ID already exists");
  }

  // Create customer
  const customer = await Customer.create({
    customer_id,
    name,
    email,
    password,
    phone,
    address,
  });

  // Generate token
  const token = customer.getSignedJwtToken();

  res.status(201).json({
    success: true,
    message: "Customer registered successfully",
    token,
    customer: {
      id: customer._id,
      customer_id: customer.customer_id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    },
  });
});

/**
 * @desc    Login customer
 * @route   POST /api/customers/login
 * @access  Public
 */
export const loginCustomer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  // Check for customer and include password (since it's select: false)
  const customer = await Customer.findOne({ email }).select("+password");

  if (!customer) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Check if password matches
  const isMatch = await customer.matchPassword(password);

  if (!isMatch) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Generate token
  const token = customer.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    customer: {
      id: customer._id,
      customer_id: customer.customer_id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    },
  });
});

/**
 * @desc    Get current logged in customer
 * @route   GET /api/customers/me
 * @access  Private/Customer
 */
export const getMeCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.user._id);

  if (!customer) {
    throw new NotFoundError("Customer");
  }

  res.status(200).json({
    success: true,
    customer,
  });
});

/**
 * @desc    Update customer password
 * @route   PUT /api/customers/updatepassword
 * @access  Private/Customer
 */
export const updateCustomerPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new BadRequestError("Please provide current and new password");
  }

  // Get customer with password
  const customer = await Customer.findById(req.user._id).select("+password");

  if (!customer) {
    throw new NotFoundError("Customer");
  }

  // Check current password
  if (!(await customer.matchPassword(currentPassword))) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  // Update password
  customer.password = newPassword;
  await customer.save();

  // Generate new token
  const token = customer.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
    token,
  });
});

/**
 * @desc    Logout customer
 * @route   POST /api/customers/logout
 * @access  Private
 */
export const logoutCustomer = asyncHandler(async (req, res) => {
  // Since JWT is stateless, logout is handled client-side by removing the token
  // This endpoint provides a consistent API and can be used for logging/logout events
  
  res.status(200).json({
    success: true,
    message: "Logged out successfully. Please remove the token from client storage.",
  });
});

