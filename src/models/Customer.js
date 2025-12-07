import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    // Reference to Users collection (REQUIRED)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Profile-specific fields
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty (optional field)
          // Accept any phone number with 7-15 digits (international standard)
          const digitsOnly = v.replace(/\D/g, "");
          return digitsOnly.length >= 7 && digitsOnly.length <= 15;
        },
        message:
          "Please provide a valid phone number (7-15 digits)",
      },
    },
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
    // Additional profile fields
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    preferences: {
      notifications: { type: Boolean, default: true },
      emailUpdates: { type: Boolean, default: true },
      smsUpdates: { type: Boolean, default: false },
      favoriteCategories: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      ],
    },
    socialLinks: {
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      twitter: { type: String, trim: true },
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            if (!v) return true; // Allow empty (optional field)
            // Accept any phone number with 7-15 digits (international standard)
            const digitsOnly = v.replace(/\D/g, "");
            return digitsOnly.length >= 7 && digitsOnly.length <= 15;
          },
          message:
            "Please provide a valid phone number (7-15 digits)",
        },
      },
      relationship: { type: String, trim: true },
    },
    bio: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Favorite artists
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Customer", customerSchema);
