import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    booking_id: {
      type: String,
      unique: true,
      required: true,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    talent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
    booking_date: {
      type: Date,
      default: Date.now,
    },
    event_date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Booked", "Completed", "Canceled"],
      default: "Booked",
    },
    payment_status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
  },
  { timestamps: true }
);
// Use existing "sales" collection (was previously named Sale)
export default mongoose.model("Booking", bookingSchema, "sales");
