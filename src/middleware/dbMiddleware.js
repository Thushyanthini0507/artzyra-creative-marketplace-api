/**
 * Database Connection Middleware
 * Ensures database connection is established before processing requests
 * Critical for serverless environments where connections may be cold
 */
import connectDB from "../config/db.js";

export const ensureDBConnection = async (req, res, next) => {
  try {
    // Ensure database connection is established
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection middleware failed:", error);
    res.status(500).json({
      success: false,
      message: "Database connection error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

