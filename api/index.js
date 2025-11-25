/**
 * Vercel Serverless Function Entry Point
 * This file is used by Vercel to handle all API requests
 */
import "dotenv/config";
import app from "../src/app.js";
import connectDB from "../src/config/db.js";

// Attempt to connect to database on cold start (non-blocking)
// The connection will be cached and reused across function invocations
connectDB().catch((err) => {
  console.error("Initial database connection attempt failed:", err.message);
  // Don't throw - connection will be retried on first request via middleware
});

export default app;

