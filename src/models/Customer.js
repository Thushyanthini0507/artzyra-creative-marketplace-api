import mongoose from "mongoose";
import { generateToken } from "../config/jwt.js";

const customerSchema = new mongoose.Schema(
  {
    // Reference to Users collection (REQUIRED)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Profile-specific fields
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    profileImage: {
      type: String,
      default: "",
    },
    // Status fields (synced with Users collection)
    isApproved: {
      type: Boolean,
      default: true, // Customers are auto-approved
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate JWT token (uses userId from Users collection)
customerSchema.methods.getSignedJwtToken = function () {
  return generateToken({ id: this.userId, role: "customer" });
};

export default mongoose.model("Customer", customerSchema);
