import Customer from "../models/Customer.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { NotFoundError, UnauthorizedError } from "../utils/errors.js";

// Get all customers
export const getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find();

  res.status(200).json({
    success: true,
    length: customers.length,
    customers,
  });
});

// Get a customer by Id
export const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await Customer.findById(id);

  if (!customer) {
    throw new NotFoundError("Customer");
  }

  // Check if customer is accessing their own data or is admin
  if (req.user.role === "Customer" && req.user._id.toString() !== id) {
    throw new UnauthorizedError("Not authorized to access this customer's data");
  }

  res.status(200).json({
    success: true,
    customer,
  });
});

// Create a customer
export const createCustomer = asyncHandler(async (req, res) => {
  const customerData = req.body;
  const newCustomer = new Customer(customerData);
  const savedCustomer = await newCustomer.save();

  res.status(201).json({
    success: true,
    message: "Customer created successfully",
    customer: savedCustomer,
  });
});

// Update a customer by Id
export const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if customer is updating their own data or is admin
  if (req.user.role === "Customer" && req.user._id.toString() !== id) {
    throw new UnauthorizedError("Not authorized to update this customer's data");
  }

  const updateData = req.body;
  const customer = await Customer.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!customer) {
    throw new NotFoundError("Customer");
  }

  res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    customer,
  });
});

// Delete a customer by Id
export const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await Customer.findByIdAndDelete(id);

  if (!customer) {
    throw new NotFoundError("Customer");
  }

  res.status(200).json({
    success: true,
    message: "Customer removed successfully",
    deletedCustomer: customer,
  });
});
