/**
 * Role-based Authorization Middleware
 * Restricts access based on user roles
 */
import { ForbiddenError } from "../utils/errors.js";
import { asyncHandler } from "./authMiddleware.js";

/**
 * Restrict route access to specific roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
export const restrictTo = (...roles) => {
  return asyncHandler((req, res, next) => {
    if (!req.user || !req.userRole) {
      throw new ForbiddenError("Not authorized. Please log in.");
    }

    if (!roles.includes(req.userRole)) {
      throw new ForbiddenError(
        `Access denied. This action requires one of the following roles: ${roles.join(", ")}`
      );
    }

    next();
  });
};

/**
 * Admin only middleware
 */
export const adminOnly = restrictTo("admin");

/**
 * Artist only middleware
 */
export const artistOnly = restrictTo("artist");

/**
 * Customer only middleware
 */
export const customerOnly = restrictTo("customer");

/**
 * Artist or Customer middleware
 */
export const artistOrCustomer = restrictTo("artist", "customer");
