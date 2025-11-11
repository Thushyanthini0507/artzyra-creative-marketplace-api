import mongoose from "mongoose";

const ServiceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    basePrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Use existing "servicecategories" collection (was previously named ServiceCategory)
export default mongoose.model("Service", ServiceCategorySchema, "servicecategories");
