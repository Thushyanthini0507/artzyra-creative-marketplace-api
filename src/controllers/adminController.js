/**
 * Admin Controller
 * Handles admin operations: user approval, user management, dashboard stats
 */
import Admin from "../models/Admin.js";
import Artist from "../models/Artist.js";
import Customer from "../models/Customer.js";
import Booking from "../models/Booking.js";
import Category from "../models/Category.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";
import { sendApprovalEmail } from "../utils/emailService.js";
import { createNotification } from "../utils/helpers.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";
import { asyncHandler } from "../middleware/authMiddleware.js";
import { formatPaginationResponse } from "../utils/paginate.js";

/**
 * Approve/Reject User
 * @route PUT /api/admin/users/approve
 */
export const approveUser = asyncHandler(async (req, res) => {
  const { userId, role, isApproved } = req.body;

  let User, userModel;
  if (role === "artist") {
    User = Artist;
    userModel = "Artist";
  } else if (role === "customer") {
    User = Customer;
    userModel = "Customer";
  } else {
    throw new BadRequestError(
      "Invalid role. Must be  artist, or customer"
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.isApproved = isApproved;
  await user.save();

  // Send email notification
  await sendApprovalEmail(user.email, user.name, isApproved);

  // Create notification
  await createNotification(
    Notification,
    user._id,
    userModel,
    "approval_status",
    isApproved ? "Account Approved" : "Account Approval Pending",
    isApproved
      ? "Your account has been approved. You can now log in."
      : "Your account approval is pending.",
    null,
    null
  );

  res.json({
    success: true,
    message: `User ${isApproved ? "approved" : "rejected"} successfully`,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved,
      },
    },
  });
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
    role,            // REQUIRED: "artist" or "customer"
    search,          // Text search across multiple fields
    isApproved,      // Approval status filter
    isActive,        // Active status filter
    category,        // Category filter (artists only)
    minRating,       // Minimum rating (artists only)
    maxHourlyRate,   // Maximum hourly rate (artists only)
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
    .select("-password")  // Exclude password from results
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
