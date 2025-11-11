import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Artist from "../models/artist.js";
import Customer from "../models/Customer.js";
import { asyncHandler } from "./errorHandler.js";
import { UnauthorizedError } from "../utils/errors.js";

/**
 * Verify JWT Token - Unified authentication for User, Artist, and Customer
 * Sets req.user with user data and req.userType ('admin', 'artist', 'customer')
 */
export const verifyToken = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    throw new UnauthorizedError("Not authorized to access this route. No token provided.");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, userType, role } = decoded;

    let user;

    // Use userType from token for efficient lookup
    switch (userType) {
      case "admin":
        user = await User.findById(id).select("-password");
        if (!user) {
          throw new UnauthorizedError("Admin user not found");
        }
        req.user = user;
        req.userType = "admin";
        // Role is already in user document for Admin
        break;

      case "artist":
        user = await Artist.findById(id).select("-password");
        if (!user) {
          throw new UnauthorizedError("Artist not found");
        }
        req.user = user;
        req.userType = "artist";
        req.user.role = "Artist"; // Set role for artists
        break;

      case "customer":
        user = await Customer.findById(id).select("-password");
        if (!user) {
          throw new UnauthorizedError("Customer not found");
        }
        req.user = user;
        req.userType = "customer";
        req.user.role = "Customer"; // Set role for customers
        break;

      default:
        // Fallback: Try all models if userType is not set (backward compatibility)
        user = await User.findById(id).select("-password");
        if (user) {
          req.user = user;
          req.userType = "admin";
          break;
        }

        user = await Artist.findById(id).select("-password");
        if (user) {
          req.user = user;
          req.userType = "artist";
          req.user.role = "Artist";
          break;
        }

        user = await Customer.findById(id).select("-password");
        if (user) {
          req.user = user;
          req.userType = "customer";
          req.user.role = "Customer";
          break;
        }

        throw new UnauthorizedError("User not found");
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token expired");
    }
    throw new UnauthorizedError("Not authorized to access this route");
  }
});

/**
 * Verify Role - Role-based authorization
 * Accepts single role string or array of roles
 * @param {string|string[]} roles - Single role or array of allowed roles
 * @returns {Function} Middleware function
 */
export const verifyRole = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError("Not authorized. Please authenticate first.");
    }

    // Flatten roles array if nested arrays are provided
    const allowedRoles = roles.flat();

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      throw new UnauthorizedError(
        `User role '${req.user.role}' is not authorized to access this route. Required roles: ${allowedRoles.join(", ")}`
      );
    }

    next();
  });
};

/**
 * Legacy middleware for backward compatibility
 */
export const protect = verifyToken;

/**
 * Legacy authorize function for backward compatibility
 */
export const authorize = verifyRole;

/**
 * Admin only middleware (Admin role)
 */
export const adminOnly = verifyRole("Admin", "Super Admin");

/**
 * Super Admin only middleware
 */
export const superAdminOnly = verifyRole("Super Admin");

/**
 * Artist only middleware
 */
export const artistOnly = verifyRole("Artist");

/**
 * Customer only middleware
 */
export const customerOnly = verifyRole("Customer");

/**
 * Combined middleware: Artist or Admin
 */
export const artistOrAdmin = verifyRole("Artist", "Admin", "Super Admin");

/**
 * Combined middleware: Customer or Admin
 */
export const customerOrAdmin = verifyRole("Customer", "Admin", "Super Admin");

/**
 * Combined middleware: Any authenticated user
 */
export const anyAuthenticated = verifyRole("Admin", "Super Admin", "Artist", "Customer");
