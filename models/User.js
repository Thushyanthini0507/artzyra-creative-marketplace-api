import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    admin_id: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Super Admin", "Moderator", "Admin"],
      default: "Admin",
    },
    contact_number: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
