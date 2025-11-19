/**
 * Admin Controller
 * Handles admin operations: user approval, user management, dashboard stats
 */
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Artist from "../models/Artist.js";
import Customer from "../models/Customer.js";
import PendingCustomer from "../models/PendingCustomer.js";
import PendingArtist from "../models/PendingArtist.js";
import Booking from "../models/Booking.js";
import Category from "../models/Category.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";
import { sendApprovalEmail } from "../utils/emailService.js";
import { createNotification } from "../utils/helpers.js";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../utils/errors.js";
import { asyncHandler } from "../middleware/authMiddleware.js";
import { formatPaginationResponse } from "../utils/paginate.js";

/**
 * Approve/Reject Pending User
 * Moves user from pending table to Users + profile table
 * @route PUT /api/admin/users/approve
 */
export const approveUser = asyncHandler(async (req, res) => {
  const { pendingId, role, isApproved } = req.body;

  if (!pendingId || !role) {
    throw new BadRequestError("Please provide pendingId and role");
  }

  // Customers get instant access - they don't go through approval
  // Only artists and other roles require approval
  if (role === "customer") {
    throw new BadRequestError(
      "Customers get instant access and do not require admin approval. This endpoint is only for artists and other roles."
    );
  }

  if (role !== "artist") {
    throw new BadRequestError(
      "Invalid role. Currently only artists require approval"
    );
  }

  // Handle ARTIST approval
  if (role === "artist") {
    const pendingArtist = await PendingArtist.findById(pendingId)
      .select("+password")
      .populate("category");
    if (!pendingArtist) {
      throw new NotFoundError("Pending artist not found");
    }

    if (isApproved) {
      // Check if user already exists in Users collection
      const existingUser = await User.findOne({
        email: pendingArtist.email,
      });
      if (existingUser) {
        throw new ConflictError("User with this email already exists");
      }

      // Step 1: Create user in Users collection
      // Create with temporary password, then update with actual hashed password
      const user = await User.create({
        name: pendingArtist.name,
        email: pendingArtist.email,
        phone: pendingArtist.phone,
        password: "temp123", // Temporary password (will be replaced)
        role: "artist",
        category: pendingArtist.category._id,
        isApproved: true,
        isActive: true,
      });
      // Update password directly in database to bypass pre-save hook (password is already hashed)
      await User.updateOne(
        { _id: user._id },
        { $set: { password: pendingArtist.password } }
      );

      // Step 2: Create Artist profile
      const artist = await Artist.create({
        userId: user._id,
        bio: pendingArtist.bio,
        profileImage: pendingArtist.profileImage,
        category: pendingArtist.category._id,
        skills: pendingArtist.skills || [],
        hourlyRate: pendingArtist.hourlyRate || 0,
        availability: pendingArtist.availability || {},
        isApproved: true,
        isActive: true,
      });

      // Step 3: Link User to Artist profile
      user.profileRef = artist._id;
      user.profileType = "Artist";
      await user.save();

      // Step 4: Update pending artist status and delete
      pendingArtist.status = "approved";
      await pendingArtist.save();
      await PendingArtist.findByIdAndDelete(pendingId);

      // Send email notification
      await sendApprovalEmail(user.email, user.name, true);

      // Create notification
      await createNotification(
        Notification,
        user._id,
        "Artist",
        "approval_status",
        "Account Approved",
        "Your account has been approved. You can now log in.",
        null,
        null
      );

      return res.json({
        success: true,
        message: "Artist approved successfully",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isApproved: user.isApproved,
            profileId: artist._id,
          },
        },
      });
    } else {
      // Reject artist
      pendingArtist.status = "rejected";
      await pendingArtist.save();

      // Send email notification
      await sendApprovalEmail(pendingArtist.email, pendingArtist.name, false);

      return res.json({
        success: true,
        message: "Artist registration rejected",
        data: {
          pendingId: pendingArtist._id,
          email: pendingArtist.email,
          status: pendingArtist.status,
        },
      });
    }
  }
});

/**
 * Get users by role with search and filtering (Admin only)
 * @route GET /api/admin/users
 * Query params: role, search, isApproved, isActive, category, minRating, maxHourlyRate, page, limit, sortBy, sortOrder
 *
 * EXPLANATION:
 * - role: REQUIRED - "artist" or "customer"
 * - search: Searches in name, email, bio (artists), skills (artists) - case-insensitive
 * - isApproved: Filter by approval status (true/false)
 * - isActive: Filter by active status (true/false)
 * - category: Filter artists by category ID
 * - minRating: Minimum rating for artists (0-5)
 * - maxHourlyRate: Maximum hourly rate for artists
 * - page, limit, sortBy, sortOrder: Pagination and sorting
 */
export const getUsersByRole = asyncHandler(async (req, res) => {
  const {
    role, // REQUIRED: "artist" or "customer"
    search, // Text search across multiple fields
    isApproved, // Approval status filter
    isActive, // Active status filter
    category, // Category filter (artists only)
    minRating, // Minimum rating (artists only)
    maxHourlyRate, // Maximum hourly rate (artists only)
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Validate required role parameter
  if (!role) {
    throw new BadRequestError("Please specify a role (artist or customer)");
  }

  // Determine which model to use based on role
  let User;
  if (role === "artist") {
    User = Artist;
  } else if (role === "customer") {
    User = Customer;
  } else {
    throw new BadRequestError("Invalid role. Must be artist or customer");
  }

  // Start with empty query - will build filters
  const query = {};

  // SEARCH FILTER
  // Searches across multiple fields using $or operator
  // For artists: name, email, bio, skills
  // For customers: name, email
  // $regex with "i" option = case-insensitive
  // $in with RegExp = search in array fields (skills)
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
    // Add artist-specific search fields
    if (role === "artist") {
      query.$or.push(
        { bio: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } }
      );
    }
  }

  // STATUS FILTERS
  // Convert string "true"/"false" to boolean
  // Example: ?isApproved=true
  if (isApproved !== undefined) {
    query.isApproved = isApproved === "true";
  }
  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  // ARTIST-SPECIFIC FILTERS
  // Only apply these filters when role is "artist"
  if (role === "artist") {
    // Filter by category ID
    if (category) {
      query.category = category;
    }
    // Filter by minimum rating
    // $gte = greater than or equal to
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }
    // Filter by maximum hourly rate
    // $lte = less than or equal to
    if (maxHourlyRate) {
      query.hourlyRate = { $lte: parseFloat(maxHourlyRate) };
    }
  }

  // PAGINATION AND SORTING
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // EXECUTE QUERY
  const users = await User.find(query)
    .select("-password") // Exclude password from results
    .populate("category", "name description")
    .skip(skip)
    .limit(limitNum)
    .sort(sort);

  const total = await User.countDocuments(query);

  const response = formatPaginationResponse(users, total, page, limit);

  res.json({
    success: true,
    data: response.data,
    pagination: response.pagination,
  });
});

/**
 * Get user by ID (Admin only)
 * @route GET /api/admin/users/:role/:userId
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { userId, role } = req.params;

  let User;
  if (role === "artist") {
    User = Artist;
  } else if (role === "customer") {
    User = Customer;
  } else {
    throw new BadRequestError("Invalid role. Must be artist or customer");
  }

  const user = await User.findById(userId)
    .select("-password")
    .populate("category", "name description image");

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json({
    success: true,
    data: {
      user,
    },
  });
});

/**
 * Get all bookings with search and filtering (Admin only)
 * @route GET /api/admin/bookings
 * Query params: search, status, paymentStatus, customer, artist, category, startDate, endDate, minAmount, maxAmount, page, limit, sortBy, sortOrder
 *
 * EXPLANATION:
 * Admin can see all bookings with comprehensive filtering options
 * - search: Searches in location and specialRequests
 * - status: Booking status filter
 * - paymentStatus: Payment status filter
 * - customer/artist/category: Filter by specific IDs
 * - startDate/endDate: Date range filter
 * - minAmount/maxAmount: Amount range filter
 */
export const getAllBookings = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    paymentStatus,
    customer,
    artist,
    category,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Start with empty query - admin can see all bookings
  const query = {};

  // STATUS FILTERS
  if (status) {
    query.status = status;
  }
  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  // USER FILTERS
  // Admin can filter by specific customer, artist, or category
  if (customer) {
    query.customer = customer;
  }
  if (artist) {
    query.artist = artist;
  }
  if (category) {
    query.category = category;
  }

  // DATE RANGE FILTER
  if (startDate || endDate) {
    query.bookingDate = {};
    if (startDate) {
      query.bookingDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.bookingDate.$lte = new Date(endDate);
    }
  }

  // AMOUNT RANGE FILTER
  if (minAmount || maxAmount) {
    query.totalAmount = {};
    if (minAmount) {
      query.totalAmount.$gte = parseFloat(minAmount);
    }
    if (maxAmount) {
      query.totalAmount.$lte = parseFloat(maxAmount);
    }
  }

  // SEARCH FILTER
  // Searches in location and specialRequests fields
  if (search) {
    query.$or = [
      { location: { $regex: search, $options: "i" } },
      { specialRequests: { $regex: search, $options: "i" } },
    ];
  }

  // PAGINATION AND SORTING
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const bookings = await Booking.find(query)
    .populate("customer", "name email phone")
    .populate("artist", "name email phone profileImage rating")
    .populate("category", "name description")
    .skip(skip)
    .limit(limitNum)
    .sort(sort);

  const total = await Booking.countDocuments(query);

  const response = formatPaginationResponse(bookings, total, page, limit);

  res.json({
    success: true,
    data: response.data,
    pagination: response.pagination,
  });
});

/**
 * Get pending customers (Admin only)
 * Note: Customers now get instant access and don't go through approval
 * This endpoint is kept for backward compatibility but will typically return empty results
 * @route GET /api/admin/pending/customers
 */
export const getPendingCustomers = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  // Status filter
  if (status) {
    query.status = status;
  } else {
    // Default to pending if no status specified
    query.status = "pending";
  }

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const pendingCustomers = await PendingCustomer.find(query)
    .select("-password")
    .skip(skip)
    .limit(limitNum)
    .sort(sort);

  const total = await PendingCustomer.countDocuments(query);

  const response = formatPaginationResponse(
    pendingCustomers,
    total,
    page,
    limit
  );

  res.json({
    success: true,
    message:
      total === 0
        ? "No pending customers. Customers now get instant access upon registration."
        : "Pending customers retrieved successfully",
    data: response.data,
    pagination: response.pagination,
  });
});

/**
 * Get pending artists (Admin only)
 * @route GET /api/admin/pending/artists
 */
export const getPendingArtists = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    category,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  // Status filter
  if (status) {
    query.status = status;
  } else {
    // Default to pending if no status specified
    query.status = "pending";
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { bio: { $regex: search, $options: "i" } },
      { skills: { $in: [new RegExp(search, "i")] } },
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const pendingArtists = await PendingArtist.find(query)
    .select("-password")
    .populate("category", "name description")
    .skip(skip)
    .limit(limitNum)
    .sort(sort);

  const total = await PendingArtist.countDocuments(query);

  const response = formatPaginationResponse(pendingArtists, total, page, limit);

  res.json({
    success: true,
    data: response.data,
    pagination: response.pagination,
  });
});

/**
 * Get dashboard stats (Admin only)
 * @route GET /api/admin/dashboard/stats
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalArtists,
    totalCustomers,
    totalBookings,
    pendingBookings,
    totalRevenue,
    totalCategories,
    totalPayments,
    totalReviews,
  ] = await Promise.all([
    Artist.countDocuments(),
    Customer.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ status: "pending" }),
    Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Category.countDocuments({ isActive: true }),
    Payment.countDocuments({ status: "completed" }),
    Review.countDocuments({ isVisible: true }),
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalArtists,
        totalCustomers,
        totalBookings,
        pendingBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCategories,
        totalPayments,
        totalReviews,
      },
    },
  });
});
