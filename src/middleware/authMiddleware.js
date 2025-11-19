/**
 * Authentication Middleware
 * Provides JWT verification and approval checks
 * Uses centralized Users collection
 */
import { verifyToken as verifyJwtToken } from "../config/jwt.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Artist from "../models/Artist.js";
import Customer from "../models/Customer.js";
import CategoryUser from "../models/CategoryUser.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * JWT verification middleware
 * Verifies JWT token and loads user based on role
 */
export const verifyToken = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new UnauthorizedError("Not authorized. No token provided.");
  }

  try {
    // Verify token
    const decoded = verifyJwtToken(token);

    // Find user in Users collection (central collection)
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      throw new UnauthorizedError("User not found. Token may be invalid.");
    }

    // Verify role matches
    if (user.role !== decoded.role) {
      throw new UnauthorizedError("Invalid token. Role mismatch.");
    }

    // Check if user is active
    if (user.isActive === false) {
      throw new ForbiddenError(
        "Your account has been deactivated. Please contact support."
      );
    }

    // Get profile from role-specific collection
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

    // Attach user and profile to request
    req.user = { ...user.toObject(), profile };
    req.userId = user._id;
    req.userRole = user.role;
    req.userModel = user.profileType;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Invalid token. Please log in again.");
    }
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token expired. Please log in again.");
    }
    throw error;
  }
});

// Backward compatibility export (to be deprecated)
export const authenticate = verifyToken;

/**
 * Check if user account is approved
 * Should be used after authenticate middleware
 */
export const checkApproval = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError("Not authorized. Please log in.");
  }

  // Admins and customers are always approved (customers are auto-approved)
  if (req.userRole === "admin" || req.userRole === "customer") {
    return next();
  }

  // Check if user is approved (for artists)
  if (!req.user.isApproved) {
    throw new ForbiddenError(
      "Your account is pending approval. Please wait for admin approval."
    );
  }

  next();
});
