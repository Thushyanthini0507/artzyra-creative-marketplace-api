import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
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
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "lkr",
    },
    status: {
      type: String,
      enum: ["pending", "held", "succeeded", "failed", "refunded"],
      default: "pending",
    },
    // Platform commission tracking
    platformCommissionPercent: {
      type: Number,
      default: 15, // 15% platform commission
    },
    platformCommissionAmount: {
      type: Number,
    },
    artistPayoutAmount: {
      type: Number,
    },
    // Payment release tracking
    releasedAt: {
      type: Date,
    },
    releasedToArtist: {
      type: Boolean,
      default: false,
    },
    stripePaymentIntentId: {
      type: String,
      // required: true, // Made optional to allow creation before payment intent is fully confirmed/available in some flows
    },
    stripeChargeId: {
      type: String,
    },
    stripeTransferId: {
      type: String, // For tracking transfer to artist
    },
    paymentMethod: {
      type: String,
      default: "card",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Payment", paymentSchema);
