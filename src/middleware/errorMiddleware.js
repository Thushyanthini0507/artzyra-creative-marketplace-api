/**
 * Global Error Handling Middleware
 * Handles all errors and sends appropriate responses
 */
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from "../utils/errors.js";

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error("Error:", err);

  // Mongoose bad ObjectId (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found with id: ${err.value}`;
    error = new NotFoundError(message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    const value = err.keyValue ? err.keyValue[field] : "value";
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    error = new ConflictError(message);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => val.message);
    const message = `Validation Error: ${errors.join(", ")}`;
    error = new ValidationError(message, errors);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    error = new UnauthorizedError(message);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired. Please log in again.";
    error = new UnauthorizedError(message);
  }

  // Custom AppError handling
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.message, // Also include as 'error' for frontend compatibility
      ...(err.errors && { errors: err.errors }),
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Default server error
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    error: message, // Also include as 'error' for frontend compatibility
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

export default errorHandler;
