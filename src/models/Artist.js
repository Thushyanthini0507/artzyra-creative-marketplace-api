import mongoose from "mongoose";
import { generateToken } from "../config/jwt.js";
import Category from "./Category.js";

const artistSchema = new mongoose.Schema(
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
    bio: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Category,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    hourlyRate: {
      type: Number,
      default: 0,
    },
    availability: {
      type: Map,
      of: {
        start: String,
        end: String,
        available: Boolean,
      },
      default: {},
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    // Status fields (synced with Users collection)
    isApproved: {
      type: Boolean,
      default: false, // Requires admin approval
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
artistSchema.methods.getSignedJwtToken = function () {
  return generateToken({ id: this.userId, role: "artist" });
};

// Index for search
artistSchema.index({ name: "text", bio: "text", skills: "text" });

export default mongoose.model("Artist", artistSchema);
