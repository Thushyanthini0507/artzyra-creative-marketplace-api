import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(process.env.MONGO_URI);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    useNewUrlParser: true;
    useUnifiedTopology: true;
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

export default connectDB;
