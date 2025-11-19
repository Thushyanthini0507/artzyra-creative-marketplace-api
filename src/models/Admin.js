import mongoose from "mongoose";
import { generateToken } from "../config/jwt.js";

const adminSchema = new mongoose.Schema(
  {
    // Reference to Users collection (REQUIRED)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Admin-specific fields can be added here
    permissions: {
      type: [String],
      default: [],
    },
    // Status fields (synced with Users collection)
    isApproved: {
      type: Boolean,
      default: true, // Admins are auto-approved
    },
  },
  {
    timestamps: true,
  }
);

// Generate JWT token (uses userId from Users collection)
adminSchema.methods.getSignedJwtToken = function () {
  return generateToken({ id: this.userId, role: "admin" });
};

export default mongoose.model("Admin", adminSchema);
