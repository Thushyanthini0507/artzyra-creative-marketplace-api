import User from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ConflictError,
} from "../utils/errors.js";

/**
 * @desc    Register new user
 * @route   POST /api/users/register
 * @access  Public (for first user) / Private/Admin (for subsequent users)
 */
export const register = asyncHandler(async (req, res) => {
  const { admin_id, name, email, password, role, contact_number } = req.body;

  // Validation
  if (!admin_id || !name || !email || !password) {
    throw new BadRequestError("Please provide all required fields");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ConflictError("User already exists with this email");
  }

  // Check if admin_id already exists
  const adminIdExists = await User.findOne({ admin_id });
  if (adminIdExists) {
    throw new ConflictError("Admin ID already exists");
  }

  // Check if this is the first user (allow without auth) or if user is admin
  const userCount = await User.countDocuments();
  const isFirstUser = userCount === 0;
  const isAdmin = req.user && ["Super Admin", "Admin"].includes(req.user.role);

  // Determine user role
  let userRole;
  if (isFirstUser) {
    // First user must be Super Admin
    userRole = "Super Admin";
  } else if (isAdmin && role) {
    // Admin can set any role
    userRole = role;
  } else if (isAdmin) {
    // Admin creating user without specifying role defaults to Admin
    userRole = "Admin";
  } else {
    // Public registration - allow regular users to register
    // Default to "Admin" role for User model registrations
    // Note: Customers and Artists should use their respective endpoints
    userRole = role || "Admin";
  }

  // Allow public registration - removed restriction that blocked non-admin users

  // Create user
  const user = await User.create({
    admin_id,
    name,
    email,
    password,
    role: userRole,
    contact_number,
  });

  // Generate token
  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    message: isFirstUser
      ? "First admin user created successfully"
      : "User registered successfully",
    token,
    user: {
      id: user._id,
      admin_id: user.admin_id,
      name: user.name,
      email: user.email,
      role: user.role,
      contact_number: user.contact_number,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/users/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  // Check for user and include password (since it's select: false)
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Generate token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      admin_id: user.admin_id,
      name: user.name,
      email: user.email,
      role: user.role,
      contact_number: user.contact_number,
    },
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/users/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");

  res.status(200).json({
    success: true,
    length: users.length,
    users,
  });
});

/**
 * @desc    Get a user by Id (Admin only)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new NotFoundError("User");
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Update user (Admin only)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Don't allow password update through this route
  const { password, ...updateData } = req.body;

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    throw new NotFoundError("User");
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});

/**
 * @desc    Delete user (Super Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Super Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (id === req.user._id.toString()) {
    throw new BadRequestError("You cannot delete your own account");
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new NotFoundError("User");
  }

  res.status(200).json({
    success: true,
    message: "User removed successfully",
  });
});

/**
 * @desc    Update password
 * @route   PUT /api/users/updatepassword
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new BadRequestError("Please provide current and new password");
  }

  // Get user with password
  const user = await User.findById(req.user._id).select("+password");

  // Check current password
  if (!(await user.matchPassword(currentPassword))) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
    token,
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/users/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Since JWT is stateless, logout is handled client-side by removing the token
  // This endpoint provides a consistent API and can be used for logging/logout events
  
  res.status(200).json({
    success: true,
    message: "Logged out successfully. Please remove the token from client storage.",
  });
});
