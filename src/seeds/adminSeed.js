/**
 * Admin Seed Script
 * Seeds a single admin user into the database
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import connectDB from "../config/db.js";

// Load environment variables
dotenv.config();

/**
 * Admin user data
 */
const adminData = {
  name: "Admin",
  email: "admin12@gmail.com",
  password: "admin123",
  role: "admin",
};

/**
 * Seed Admin User
 */
const seedAdmin = async () => {
  try {
    console.log("🌱 Starting admin seed...\n");

    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...");
    await connectDB();
    console.log("✓ MongoDB connected successfully\n");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log(`✓ Admin user already exists: ${existingAdmin.name} (${existingAdmin.email})`);
      console.log("   Skipping admin creation...\n");
    } else {
      // Create admin user (password will be hashed by pre-save hook)
      const admin = await Admin.create(adminData);

      console.log(`✓ Admin user created successfully:`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   ID: ${admin._id}\n`);
    }

    console.log("✅ Admin seed completed successfully!");
  } catch (error) {
    console.error("❌ Error during admin seeding:", error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

// Run seed if this file is executed directly
seedAdmin();

export default seedAdmin;

