/**
 * Global error handling middleware
 * Location: /middleware/errorHandler.js
 */

import { AppError } from "../utils/errors.js";

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // Handle custom AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

    // Include validation errors if present
    if (err.errors && Array.isArray(err.errors)) {
      errors = err.errors;
    }

    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    const value = err.keyValue ? err.keyValue[field] : "value";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    return res.status(statusCode).json({
      success: false,
      message,
      field,
      value,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // Handle "not found" errors (string matching for backward compatibility)
  if (message.toLowerCase().includes("not found")) {
    statusCode = 404;
  }

  // Handle unauthorized errors
  if (message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("not authorized")) {
    statusCode = 401;
  }

  // Handle forbidden errors
  if (message.toLowerCase().includes("forbidden")) {
    statusCode = 403;
  }

  // Handle validation errors
  if (message.toLowerCase().includes("validation") || message.toLowerCase().includes("invalid")) {
    if (statusCode === 500) statusCode = 400;
  }

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error Details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  }

  // Log error in production (without stack trace)
  if (process.env.NODE_ENV === "production" && statusCode >= 500) {
    console.error("Server Error:", {
      name: err.name,
      message: err.message,
      statusCode,
    });
  }

  // Default error response
  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : message,
    ...(process.env.NODE_ENV === "development" && {
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    }),
    ...(errors && { errors }),
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * This eliminates the need for try-catch blocks in controllers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
