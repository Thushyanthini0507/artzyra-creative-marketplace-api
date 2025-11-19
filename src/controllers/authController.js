/**
 * Authentication Controller
 * Handles login using centralized Users collection
 */
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Artist from "../models/Artist.js";
import Admin from "../models/Admin.js";
import CategoryUser from "../models/CategoryUser.js";
import PendingCustomer from "../models/PendingCustomer.js";
import PendingArtist from "../models/PendingArtist.js";
import { BadRequestError, UnauthorizedError } from "../utils/errors.js";
import { asyncHandler } from "../middleware/authMiddleware.js";
import { generateToken } from "../config/jwt.js";

/**
 * Login
 * Uses Users collection for authentication
 * @route POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new BadRequestError("Please provide a valid email address");
  }

  // Validate password is provided
  if (password.length < 1) {
    throw new BadRequestError("Password is required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Find user in Users collection (include password for comparison)
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password"
  );

  // If user not found in Users, check pending tables (only for non-customer roles)
  if (!user) {
    // Check if user is in pending tables (only artists and other roles, not customers)
    const pendingArtist = await PendingArtist.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (pendingArtist) {
      throw new UnauthorizedError(
        "Your account is pending approval. Please wait for admin approval before logging in."
      );
    }

    // User doesn't exist in Users or pending tables
    throw new UnauthorizedError("Invalid email or password");
  }

  // If role is provided, validate it matches
  if (role && user.role !== role) {
    throw new UnauthorizedError(
      `Invalid role. This account is registered as ${user.role}`
    );
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Check if user is approved
  // Customers and admins are auto-approved and get instant access
  // Other roles (Artist, CategoryUser, etc.) require admin approval
  if (user.role !== "admin" && user.role !== "customer" && !user.isApproved) {
    throw new UnauthorizedError(
      "Your account is pending approval. Please wait for admin approval before logging in."
    );
  }

  // Check if user is active
  if (user.isActive === false) {
    throw new UnauthorizedError(
      "Your account has been deactivated. Please contact support."
    );
  }

  // Get profile data from role-specific collection
  let profile = null;
  if (user.profileType === "Customer") {
    profile = await Customer.findOne({ userId: user._id });
  } else if (user.profileType === "Artist") {
    profile = await Artist.findOne({ userId: user._id })
      .populate("category", "name description");
  } else if (user.profileType === "Admin") {
    profile = await Admin.findOne({ userId: user._id });
  } else if (user.profileType === "CategoryUser") {
    profile = await CategoryUser.findOne({ userId: user._id })
      .populate("category", "name description");
  }

  // Generate token using user ID from Users collection
  const token = generateToken({ id: user._id, role: user.role });

  // Determine redirect path based on role
  let redirectPath = "/";
  switch (user.role) {
    case "customer":
      redirectPath = "/customer/dashboard";
      break;
    case "artist":
      redirectPath = "/artist/dashboard";
      break;
    case "admin":
      redirectPath = "/admin/dashboard";
      break;
    case "category":
      redirectPath = "/category/dashboard";
      break;
    default:
      redirectPath = "/";
  }

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isApproved: user.isApproved,
        isActive: user.isActive,
        category: user.category,
      },
      profile,
      token,
      redirectPath, // Role-based redirection path for frontend
    },
  });
});

/**
 * Get current user
 * @route GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  // User is already attached to req by authenticate middleware
  // Get full profile data
  const user = await User.findById(req.userId)
    .select("-password")
    .populate("category", "name description");

  let profile = null;
  if (user.profileType === "Customer") {
    profile = await Customer.findOne({ userId: user._id });
  } else if (user.profileType === "Artist") {
    profile = await Artist.findOne({ userId: user._id })
      .populate("category", "name description");
  } else if (user.profileType === "Admin") {
    profile = await Admin.findOne({ userId: user._id });
  } else if (user.profileType === "CategoryUser") {
    profile = await CategoryUser.findOne({ userId: user._id })
      .populate("category", "name description");
  }

  res.json({
    success: true,
    data: {
      user,
      profile,
    },
  });
});

export const getProfile = getMe;

/**
 * Logout
 * @route POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  // Since JWT tokens are stateless, logout is primarily handled client-side
  // by removing the token from storage. This endpoint validates the token
  // and confirms logout.

  res.json({
    success: true,
    message: "Logout successful. Please remove the token from client storage.",
    data: {
      userId: req.userId,
      role: req.userRole,
    },
  });
});
