import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: [String, "Name is required"],
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ["admin", "cashier"],
      default: "cashier",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    strict: true,
    versionKey: false,
  }
);

export default mongoose.model("User", userSchema);
