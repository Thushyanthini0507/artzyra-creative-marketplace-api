import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Service Selection
    service: {
      type: String, // Service type (Logo design, Video editing, Online class, Voice-over, etc.)
      required: true,
    },
    package: {
      type: String,
      enum: ["basic", "standard", "premium", "custom"],
      default: "basic",
    },
    customRequirements: {
      type: String,
      trim: true,
    },
    // Project Details
    projectTitle: {
      type: String,
      trim: true,
    },
    projectDescription: {
      type: String,
      trim: true,
    },
    referenceLinks: [
      {
        type: String,
        trim: true,
      },
    ],
    uploadedFiles: [
      {
        url: String,
        filename: String,
        fileType: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    // Delivery Timeline
    expectedDeliveryDate: {
      type: Date,
    },
    urgency: {
      type: String,
      enum: ["normal", "express"],
      default: "normal",
    },
    revisionCount: {
      requested: { type: Number, default: 0 },
      used: { type: Number, default: 0 },
      limit: { type: Number, default: 3 }, // Default revision limit
    },
    // Communication Preference
    emailUpdates: {
      type: Boolean,
      default: false,
    },
    // Pricing & Payment
    pricingType: {
      type: String,
      enum: ["package", "custom_quote"],
      default: "package",
    },
    packagePrice: {
      type: Number,
    },
    customQuote: {
      amount: Number,
      approved: { type: Boolean, default: false },
      requestedAt: Date,
      approvedAt: Date,
    },
    paymentType: {
      type: String,
      enum: ["advance", "full"],
      default: "full",
    },
    advancePercentage: {
      type: Number,
      default: 50, // Default 50% advance
    },
    // Availability Handling
    estimatedStartDate: {
      type: Date,
    },
    artistAvailabilityStatus: {
      type: String,
      enum: ["available", "busy"],
      default: "available",
    },
    // Original booking fields (for backward compatibility)
    bookingDate: {
      type: Date,
    },
    startTime: {
      type: String,
    },
    duration: {
      type: Number, // in hours
    },
    deliveryDays: {
      type: Number, // Snapshot from Artist service at time of booking
    },
    endTime: {
      type: String,
    },
    location: {
      type: String,
    },
    notes: {
      type: String,
    },
    // Order Status Tracking
    status: {
      type: String,
      enum: ["pending", "in_progress", "review", "completed", "cancelled", "declined"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "held", "paid", "refunded", "failed", "partial"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    amountRefunded: {
      type: Number,
      default: 0,
    },
    stripePaymentIntentId: {
      type: String,
    },
    // Revision & Approval Flow
    revisions: [
      {
        requestedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        requestedAt: { type: Date, default: Date.now },
        description: String,
        status: {
          type: String,
          enum: ["pending", "in_progress", "completed", "rejected"],
          default: "pending",
        },
        completedAt: Date,
      },
    ],
    finalApproval: {
      approved: { type: Boolean, default: false },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      approvedAt: Date,
      notes: String,
    },
    // Cancellation & Refund
    cancellation: {
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      cancelledAt: Date,
      reason: String,
      refundAmount: Number,
      refundStatus: {
        type: String,
        enum: ["pending", "processed", "rejected"],
      },
      cancellationWindow: {
        type: Number, // Hours before start date
        default: 24,
      },
    },
    // Dispute
    dispute: {
      raisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      raisedAt: Date,
      reason: String,
      description: String,
      evidence: [String],
      status: {
        type: String,
        enum: ["open", "resolved", "closed"],
      },
      adminDecision: String,
      resolvedAt: Date,
    },
    // Chat
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    // Review
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
    // Admin controls
    adminNotes: [
      {
        note: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Calculate end time before saving if not provided
bookingSchema.pre("save", function (next) {
  if (this.startTime && this.duration && !this.endTime) {
    // Simple calculation assuming HH:mm format
    const [hours, minutes] = this.startTime.split(":").map(Number);
    const endHour = hours + this.duration;
    this.endTime = `${endHour.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }
  next();
});

// Indexes for better query performance
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ artist: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
