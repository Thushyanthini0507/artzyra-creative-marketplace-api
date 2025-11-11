import User from "../models/User.js";
import Artist from "../models/artist.js";
import Customer from "../models/Customer.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Review from "../models/review.js";
import Service from "../models/service.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { NotFoundError, BadRequestError, UnauthorizedError } from "../utils/errors.js";

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get counts for all entities
  const [
    totalUsers,
    totalArtists,
    totalCustomers,
    totalBookings,
    totalPayments,
    totalReviews,
    totalServices,
    activeArtists,
    pendingBookings,
    completedBookings,
    totalRevenue,
  ] = await Promise.all([
    User.countDocuments(),
    Artist.countDocuments(),
    Customer.countDocuments(),
    Booking.countDocuments(),
    Payment.countDocuments(),
    Review.countDocuments(),
    Service.countDocuments(),
    Artist.countDocuments({ status: "Active" }),
    Booking.countDocuments({ status: "Booked" }),
    Booking.countDocuments({ status: "Completed" }),
    Payment.aggregate([
      { $match: { status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  // Get recent bookings
  const recentBookings = await Booking.find()
    .populate("customer_id", "name email phone")
    .populate("talent_id", "name category email")
    .sort({ createdAt: -1 })
    .limit(10);

  // Get recent payments
  const recentPayments = await Payment.find()
    .populate("customer_id", "name email phone")
    .sort({ createdAt: -1 })
    .limit(10);

  // Calculate revenue
  const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalArtists,
        totalCustomers,
        totalBookings,
        totalPayments,
        totalReviews,
        totalServices,
      },
      artists: {
        total: totalArtists,
        active: activeArtists,
        inactive: totalArtists - activeArtists,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        completed: completedBookings,
        canceled: totalBookings - pendingBookings - completedBookings,
      },
      revenue: {
        total: revenue,
        currency: "USD",
      },
      recentBookings,
      recentPayments,
    },
  });
});

/**
 * @desc    Get all system statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getSystemStats = asyncHandler(async (req, res) => {
  const stats = {
    users: await User.countDocuments(),
    artists: await Artist.countDocuments(),
    customers: await Customer.countDocuments(),
    bookings: await Booking.countDocuments(),
    payments: await Payment.countDocuments(),
    reviews: await Review.countDocuments(),
    services: await Service.countDocuments(),
  };

  res.status(200).json({
    success: true,
    stats,
  });
});

/**
 * @desc    Approve artist (change status to Active)
 * @route   PUT /api/admin/artists/:id/approve
 * @access  Private/Admin
 */
export const approveArtist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const artist = await Artist.findByIdAndUpdate(
    id,
    { status: "Active" },
    { new: true, runValidators: true }
  );

  if (!artist) {
    throw new NotFoundError("Artist");
  }

  res.status(200).json({
    success: true,
    message: "Artist approved successfully",
    artist,
  });
});

/**
 * @desc    Reject/Deactivate artist (change status to Inactive)
 * @route   PUT /api/admin/artists/:id/reject
 * @access  Private/Admin
 */
export const rejectArtist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const artist = await Artist.findByIdAndUpdate(
    id,
    { status: "Inactive" },
    { new: true, runValidators: true }
  );

  if (!artist) {
    throw new NotFoundError("Artist");
  }

  res.status(200).json({
    success: true,
    message: "Artist deactivated successfully",
    artist,
  });
});

/**
 * @desc    Delete review (remove inappropriate content)
 * @route   DELETE /api/admin/reviews/:id
 * @access  Private/Admin
 */
export const deleteReviewAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findByIdAndDelete(id);

  if (!review) {
    throw new NotFoundError("Review");
  }

  res.status(200).json({
    success: true,
    message: "Review deleted successfully by admin",
  });
});

/**
 * @desc    Update booking status
 * @route   PUT /api/admin/bookings/:id/status
 * @access  Private/Admin
 */
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["Booked", "Completed", "Canceled"].includes(status)) {
    throw new BadRequestError("Invalid status. Must be: Booked, Completed, or Canceled");
  }

  const booking = await Booking.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("customer_id", "name email phone")
    .populate("talent_id", "name category email");

  if (!booking) {
    throw new NotFoundError("Booking");
  }

  res.status(200).json({
    success: true,
    message: "Booking status updated successfully",
    booking,
  });
});

/**
 * @desc    Get all pending approvals (inactive artists)
 * @route   GET /api/admin/approvals
 * @access  Private/Admin
 */
export const getPendingApprovals = asyncHandler(async (req, res) => {
  const inactiveArtists = await Artist.find({ status: "Inactive" }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: inactiveArtists.length,
    artists: inactiveArtists,
  });
});

/**
 * @desc    Get all users with pagination
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsersAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;

  // Build query
  const query = {};
  if (role) {
    query.role = role;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    users,
  });
});

/**
 * @desc    Get revenue analytics
 * @route   GET /api/admin/analytics/revenue
 * @access  Private/Admin
 */
export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchQuery = { status: "Success" };
  if (startDate || endDate) {
    matchQuery.payment_date = {};
    if (startDate) matchQuery.payment_date.$gte = new Date(startDate);
    if (endDate) matchQuery.payment_date.$lte = new Date(endDate);
  }

  const revenueData = await Payment.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        totalTransactions: { $sum: 1 },
        averageTransaction: { $avg: "$amount" },
      },
    },
  ]);

  const revenueByMethod = await Payment.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$payment_method",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: revenueData[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransaction: 0,
      },
      byMethod: revenueByMethod,
    },
  });
});

