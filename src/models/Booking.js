import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    bookingDate: {
      type: Date,
      required: [true, "Please provide a booking date"],
    },
    startTime: {
      type: String,
      required: [true, "Please provide a start time"],
    },
    endTime: {
      type: String,
      required: [true, "Please provide an end time"],
    },
    duration: {
      type: Number, // in hours
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ artist: 1, status: 1 });
bookingSchema.index({ bookingDate: 1 });

export default mongoose.model("Booking", bookingSchema);
