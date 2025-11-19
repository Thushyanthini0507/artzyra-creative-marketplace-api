/**
 * Platform Seed Script
 * Seeds baseline data for admin, categories, users, bookings, payments, reviews, and notifications.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Category from "../models/Category.js";
import Customer from "../models/Customer.js";
import Artist from "../models/Artist.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";

// Load environment variables
dotenv.config();

const adminData = {
  name: "Admin",
  email: "admin12@gmail.com",
  password: "admin123",
  role: "admin",
  isApproved: true,
  isActive: true,
};

const categoryData = [
  {
    name: "DJ",
    description:
      "Professional DJs skilled in mixing music, creating playlists, and entertaining crowds.",
    image: "https://example.com/images/dj.jpg",
  },
  {
    name: "Painters",
    description:
      "Talented painters and artists specializing in portraits, murals, and custom artwork.",
    image: "https://example.com/images/painters.jpg",
  },
  {
    name: "Guitarist",
    description:
      "Skilled guitarists proficient in acoustic, electric, and classical guitar performances.",
    image: "https://example.com/images/guitarist.jpg",
  },
  {
    name: "Speakers",
    description:
      "Professional public speakers, motivational speakers, and event hosts.",
    image: "https://example.com/images/speakers.jpg",
  },
  {
    name: "Photographer",
    description:
      "Expert photographers specializing in portraits, events, and commercial photography.",
    image: "https://example.com/images/photographer.jpg",
  },
  {
    name: "Dancer",
    description:
      "Professional dancers and choreographers for performances and entertainment.",
    image: "https://example.com/images/dancer.jpg",
  },
  {
    name: "Singer",
    description:
      "Talented vocalists and singers for live performances and recording sessions.",
    image: "https://example.com/images/singer.jpg",
  },
  {
    name: "Drummer",
    description:
      "Skilled drummers and percussionists for bands and musical performances.",
    image: "https://example.com/images/drummer.jpg",
  },
  {
    name: "Pianist",
    description:
      "Professional pianists and keyboardists for concerts, events, and recordings.",
    image: "https://example.com/images/pianist.jpg",
  },
  {
    name: "Violinist",
    description:
      "Expert violinists and string musicians for classical and contemporary performances.",
    image: "https://example.com/images/violinist.jpg",
  },
];

const customerData = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "customer123",
    phone: "+1234567891",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    isApproved: true,
  },
  {
    name: "Priya Kumar",
    email: "priya.kumar@example.com",
    password: "customer123",
    phone: "+1234567892",
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      country: "USA",
    },
    isApproved: true,
  },
];

const artistData = [
  {
    name: "Sophia Lens",
    email: "sophia.lens@example.com",
    password: "artist123",
    phone: "+1234567893",
    bio: "Award-winning photographer with a passion for storytelling and capturing moments.",
    categoryName: "Photographer",
    skills: ["Photography", "Photo Editing", "Lighting"],
    hourlyRate: 150,
    isApproved: true,
  },
  {
    name: "Rhythm Collective",
    email: "rhythm.collective@example.com",
    password: "artist123",
    phone: "+1234567894",
    bio: "Energetic guitarist specializing in live performances and events.",
    categoryName: "Guitarist",
    skills: ["Acoustic Guitar", "Electric Guitar", "Live Performance"],
    hourlyRate: 200,
    isApproved: false,
  },
];

const bookingsData = [
  {
    reference: "booking_completed",
    customerEmail: "john.doe@example.com",
    artistEmail: "sophia.lens@example.com",
    categoryName: "Photographer",
    bookingDate: new Date("2024-01-15T14:00:00Z"),
    startTime: "14:00",
    endTime: "18:00",
    duration: 4,
    totalAmount: 1200,
    status: "completed",
    specialRequests: "Capture candid moments and family portraits.",
    location: "Downtown Loft Venue",
    paymentStatus: "paid",
  },
  {
    reference: "booking_pending",
    customerEmail: "priya.kumar@example.com",
    artistEmail: "rhythm.collective@example.com",
    categoryName: "Guitarist",
    bookingDate: new Date("2024-02-10T19:00:00Z"),
    startTime: "19:00",
    endTime: "22:00",
    duration: 3,
    totalAmount: 900,
    status: "pending",
    specialRequests: "Include a mix of pop and classic hits.",
    location: "City Ballroom",
    paymentStatus: "pending",
  },
];

const paymentsData = [
  {
    reference: "payment_completed",
    bookingRef: "booking_completed",
    amount: 1200,
    paymentMethod: "Card",
    transactionId: "TXN-BOOKING-COMPLETE-001",
    status: "completed",
  },
];

const reviewsData = [
  {
    bookingRef: "booking_completed",
    rating: 5,
    comment: "Outstanding photography! We love every single shot.",
  },
];

const notificationsData = [
  {
    userEmail: "sophia.lens@example.com",
    userModel: "Artist",
    type: "booking_completed",
    title: "Booking Completed",
    message: "Great job! Your booking with John Doe has been completed.",
    relatedModel: "Booking",
    relatedRef: "booking_completed",
  },
  {
    userEmail: "john.doe@example.com",
    userModel: "Customer",
    type: "review_received",
    title: "Review Submitted",
    message: "Thank you for sharing your experience with Sophia Lens.",
    relatedModel: "Review",
    relatedRef: "booking_completed",
  },
];

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting platform seed...\n");

    console.log("📡 Connecting to MongoDB...");
    await connectDB();
    console.log("✓ MongoDB connected successfully\n");

    // Seed admin - New architecture: Create User first, then Admin profile
    let adminUser = await User.findOne({
      email: adminData.email,
      role: "admin",
    });
    let admin = null;

    if (!adminUser) {
      // Step 1: Create user in Users collection
      adminUser = await User.create({
        name: adminData.name,
        email: adminData.email,
        password: adminData.password, // Will be hashed by pre-save hook
        role: "admin",
        isApproved: true, // Admins are auto-approved
        isActive: true,
      });

      // Step 2: Create Admin profile
      admin = await Admin.create({
        userId: adminUser._id,
        permissions: [],
        isApproved: true,
      });

      // Step 3: Link User to Admin profile
      adminUser.profileRef = admin._id;
      adminUser.profileType = "Admin";
      await adminUser.save();

      console.log(`✓ Admin seeded: ${adminUser.email}`);
    } else {
      // Admin user exists, fetch the profile
      admin = await Admin.findOne({ userId: adminUser._id });
      console.log(`ℹ️  Admin already exists: ${adminUser.email}`);
    }

    // Seed categories
    const categoryMap = new Map();
    for (const category of categoryData) {
      const existing = await Category.findOne({ name: category.name });
      if (existing) {
        categoryMap.set(category.name, existing);
        console.log(`ℹ️  Category exists, skipping: ${category.name}`);
        continue;
      }
      const createdCategory = await Category.create(category);
      categoryMap.set(category.name, createdCategory);
      console.log(`✓ Category created: ${category.name}`);
    }

    // Seed customers - New architecture: Create User first, then Customer profile
    const customerMap = new Map();
    for (const customerDataItem of customerData) {
      let customerUser = await User.findOne({
        email: customerDataItem.email,
        role: "customer",
      });
      let customer = null;

      if (!customerUser) {
        // Step 1: Create user in Users collection
        customerUser = await User.create({
          name: customerDataItem.name,
          email: customerDataItem.email,
          password: customerDataItem.password, // Will be hashed by pre-save hook
          phone: customerDataItem.phone,
          role: "customer",
          isApproved: true, // Customers are auto-approved
          isActive: true,
        });

        // Step 2: Create Customer profile
        customer = await Customer.create({
          userId: customerUser._id,
          address: customerDataItem.address,
          isApproved: true,
          isActive: true,
        });

        // Step 3: Link User to Customer profile
        customerUser.profileRef = customer._id;
        customerUser.profileType = "Customer";
        await customerUser.save();

        customerMap.set(customerDataItem.email, customer);
        console.log(`✓ Customer created: ${customerUser.email}`);
      } else {
        // Customer user exists, fetch the profile
        customer = await Customer.findOne({ userId: customerUser._id });
        customerMap.set(customerDataItem.email, customer);
        console.log(`ℹ️  Customer exists, skipping: ${customerUser.email}`);
      }
    }

    // Seed artists - New architecture: Create User first, then Artist profile
    const artistMap = new Map();
    for (const artistDataItem of artistData) {
      const category = categoryMap.get(artistDataItem.categoryName);
      if (!category) {
        console.warn(
          `⚠️  Category not found for artist ${artistDataItem.email}, skipping.`
        );
        continue;
      }

      let artistUser = await User.findOne({
        email: artistDataItem.email,
        role: "artist",
      });
      let artist = null;

      if (!artistUser) {
        // Step 1: Create user in Users collection
        artistUser = await User.create({
          name: artistDataItem.name,
          email: artistDataItem.email,
          password: artistDataItem.password, // Will be hashed by pre-save hook
          phone: artistDataItem.phone,
          role: "artist",
          category: category._id,
          isApproved: artistDataItem.isApproved,
          isActive: true,
        });

        // Step 2: Create Artist profile
        artist = await Artist.create({
          userId: artistUser._id,
          bio: artistDataItem.bio,
          category: category._id,
          skills: artistDataItem.skills,
          hourlyRate: artistDataItem.hourlyRate,
          isApproved: artistDataItem.isApproved,
          isActive: true,
        });

        // Step 3: Link User to Artist profile
        artistUser.profileRef = artist._id;
        artistUser.profileType = "Artist";
        await artistUser.save();

        artistMap.set(artistDataItem.email, artist);
        console.log(`✓ Artist created: ${artistUser.email}`);
      } else {
        // Artist user exists, fetch the profile
        artist = await Artist.findOne({ userId: artistUser._id });
        artistMap.set(artistDataItem.email, artist);
        console.log(`ℹ️  Artist exists, skipping: ${artistUser.email}`);
      }
    }

    // Seed bookings
    const bookingMap = new Map();
    for (const booking of bookingsData) {
      const customer = customerMap.get(booking.customerEmail);
      const artist = artistMap.get(booking.artistEmail);
      const category = categoryMap.get(booking.categoryName);

      if (!customer || !artist || !category) {
        console.warn(
          `⚠️  Missing relation for booking ${booking.reference}. Skipping.`
        );
        continue;
      }

      const existing = await Booking.findOne({
        customer: customer._id,
        artist: artist._id,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
      });

      if (existing) {
        bookingMap.set(booking.reference, existing);
        console.log(`ℹ️  Booking exists, skipping: ${booking.reference}`);
        continue;
      }

      const createdBooking = await Booking.create({
        customer: customer._id,
        artist: artist._id,
        category: category._id,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: booking.duration,
        totalAmount: booking.totalAmount,
        status: booking.status,
        specialRequests: booking.specialRequests,
        location: booking.location,
        paymentStatus: booking.paymentStatus,
      });

      bookingMap.set(booking.reference, createdBooking);
      console.log(`✓ Booking created: ${booking.reference}`);
    }

    // Seed payments
    const paymentMap = new Map();
    for (const payment of paymentsData) {
      const booking = bookingMap.get(payment.bookingRef);
      if (!booking) {
        console.warn(
          `⚠️  Booking not found for payment ${payment.reference}. Skipping.`
        );
        continue;
      }

      const existing = await Payment.findOne({ booking: booking._id });
      if (existing) {
        paymentMap.set(payment.reference, existing);
        console.log(`ℹ️  Payment exists, skipping: ${payment.reference}`);
        continue;
      }

      const createdPayment = await Payment.create({
        booking: booking._id,
        customer: booking.customer,
        artist: booking.artist,
        amount: payment.amount,
        currency: "USD",
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        status: payment.status,
        paymentDate: new Date(),
      });

      booking.payment = createdPayment._id;
      booking.paymentStatus = "paid";
      await booking.save();

      paymentMap.set(payment.reference, createdPayment);
      console.log(`✓ Payment created: ${payment.reference}`);
    }

    // Seed reviews
    for (const review of reviewsData) {
      const booking = bookingMap.get(review.bookingRef);
      if (!booking) {
        console.warn(
          `⚠️  Booking not found for review (ref: ${review.bookingRef}). Skipping.`
        );
        continue;
      }

      const existing = await Review.findOne({ booking: booking._id });
      if (existing) {
        console.log(
          `ℹ️  Review exists for booking ${review.bookingRef}, skipping.`
        );
        continue;
      }

      await Review.create({
        booking: booking._id,
        customer: booking.customer,
        artist: booking.artist,
        rating: review.rating,
        comment: review.comment,
        isVisible: true,
      });

      console.log(`✓ Review created for booking ${review.bookingRef}`);
    }

    // Seed notifications
    for (const notification of notificationsData) {
      let userDoc = null;
      if (notification.userModel === "Artist") {
        // Notification references the Artist profile, not User
        userDoc = artistMap.get(notification.userEmail);
      } else if (notification.userModel === "Customer") {
        // Notification references the Customer profile, not User
        userDoc = customerMap.get(notification.userEmail);
      } else if (notification.userModel === "Admin") {
        // Notification references the Admin profile, not User
        userDoc = admin;
      }

      if (!userDoc) {
        console.warn(
          `⚠️  User not found for notification "${notification.title}", skipping.`
        );
        continue;
      }

      let relatedId = null;
      if (notification.relatedModel === "Booking") {
        relatedId = bookingMap.get(notification.relatedRef)?._id ?? null;
      } else if (notification.relatedModel === "Review") {
        const booking = bookingMap.get(notification.relatedRef);
        if (booking) {
          const reviewDoc = await Review.findOne({ booking: booking._id });
          relatedId = reviewDoc?._id ?? null;
        }
      } else if (notification.relatedModel === "Payment") {
        relatedId = paymentMap.get(notification.relatedRef)?._id ?? null;
      }

      const existing = await Notification.findOne({
        user: userDoc._id,
        title: notification.title,
        type: notification.type,
      });

      if (existing) {
        console.log(`ℹ️  Notification exists, skipping: ${notification.title}`);
        continue;
      }

      await Notification.create({
        user: userDoc._id,
        userModel: notification.userModel,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedId,
        relatedModel: notification.relatedModel ?? null,
      });

      console.log(`✓ Notification created: ${notification.title}`);
    }

    console.log("\n✅ Platform seed completed successfully!");
  } catch (error) {
    console.error("❌ Error during platform seeding:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

seedDatabase();

export default seedDatabase;
