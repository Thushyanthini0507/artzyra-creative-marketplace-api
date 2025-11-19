/**
 * User Model
 * Central collection that stores all users (Customer, Artist, Admin, CategoryUser)
 * This is the primary collection - all users must be stored here first
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      required: [true, "Please provide a role"],
      enum: ["customer", "artist", "admin", "category"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      // Only applicable for artists and category users
    },
    // Reference to role-specific collection
    profileRef: {
      type: mongoose.Schema.Types.ObjectId,
      // This will point to Customer, Artist, Admin, or CategoryUser _id
      required: false,
    },
    profileType: {
      type: String,
      enum: ["Customer", "Artist", "Admin", "CategoryUser"],
      required: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
      // Customers are auto-approved, others need approval
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

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ email: 1, role: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);


