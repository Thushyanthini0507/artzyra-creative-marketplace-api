import mongoose from "mongoose";

// Cache connection for serverless environments
let cachedConnection = null;

const connectDB = async () => {
  try {
    // If connection already exists and is ready, reuse it
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return cachedConnection;
    }

    // If connection exists but is not ready, wait for it
    if (cachedConnection) {
      await new Promise((resolve, reject) => {
        if (mongoose.connection.readyState === 1) {
          resolve();
        } else {
          mongoose.connection.once("connected", resolve);
          mongoose.connection.once("error", reject);
          // Timeout after 5 seconds
          setTimeout(() => reject(new Error("Connection timeout")), 5000);
        }
      });
      return cachedConnection;
    }

    // MongoDB connection string format:
    // mongodb://username:password@host:port/database
    // or for MongoDB Atlas:
    // mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    // Connection options optimized for serverless
    const options = {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 5, // Maintain up to 5 socket connections
      minPoolSize: 0, // Allow 0 connections when idle (important for serverless)
      maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
      bufferCommands: false, // Disable mongoose buffering (fail fast)
      bufferMaxEntries: 0, // Disable mongoose buffering
      retryWrites: true,
      w: "majority",
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    cachedConnection = conn;

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      cachedConnection = null;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      cachedConnection = null;
    });

    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    // Provide helpful error messages
    if (error.message.includes("authentication failed")) {
      console.error("\n⚠️  Authentication Error:");
      console.error("   - Check your MongoDB username and password");
      console.error("   - Verify your MONGO_URI in .env file");
      console.error(
        "   - Format: mongodb://username:password@host:port/database"
      );
      console.error(
        "   - Or for Atlas: mongodb+srv://username:password@cluster.mongodb.net/database\n"
      );
    } else if (error.message.includes("bad auth")) {
      console.error("\n⚠️  Bad Authentication:");
      console.error("   - Username or password is incorrect");
      console.error(
        "   - Make sure special characters in password are URL-encoded"
      );
      console.error("   - Example: @ becomes %40, # becomes %23\n");
    }

    // Reset cached connection on error
    cachedConnection = null;

    // Don't exit process in Vercel/serverless environment
    // In serverless, we want to continue and let Vercel handle errors
    if (process.env.VERCEL !== "1") {
      process.exit(1);
    }

    // Re-throw error so it can be handled by the caller
    throw error;
  }
};

export default connectDB;
