import Booking from "../models/Booking.js";
import Chat from "../models/Chat.js";
import Notification from "../models/Notification.js";
import Artist from "../models/Artist.js";
import { createNotification } from "../utils/helpers.js";
import { asyncHandler } from "../middleware/authMiddleware.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../utils/errors.js";

/**
 * Create a new booking
 * @route POST /api/bookings
 */
export const createBooking = asyncHandler(async (req, res) => {
  const {
    artistId,
    service,
    package: packageType,
    customRequirements,
    projectTitle,
    projectDescription,
    referenceLinks,
    uploadedFiles,
    expectedDeliveryDate,
    urgency,
    revisionCount,
    emailUpdates,
    pricingType,
    packagePrice,
    customQuote,
    paymentType,
    advancePercentage,
    // Legacy fields for backward compatibility
    bookingDate,
    startTime,
    duration,
    location,
    notes,
    totalAmount,
  } = req.body;

  // Required fields validation
  if (!artistId || !service) {
    throw new BadRequestError("Artist ID and service are required");
  }

  // Prevent booking with yourself
  if (req.userId.toString() === artistId) {
    throw new BadRequestError("You cannot book yourself");
  }

  // Find artist profile to check type, availability, and get delivery time
  const artistProfile = await Artist.findOne({ userId: artistId }).populate("category");
  
  if (!artistProfile) {
    throw new NotFoundError("Artist not found");
  }

  // Check artist availability status
  if (artistProfile.availability && typeof artistProfile.availability === "object") {
    const availabilityMap = artistProfile.availability instanceof Map 
      ? Object.fromEntries(artistProfile.availability) 
      : artistProfile.availability;
    
    // Check if artist is marked as busy (you might want to add a status field to Artist model)
    // For now, we'll allow booking but set the status
  }

  // Calculate estimated start date (if not provided, use current date + 1 day)
  const estimatedStartDate = expectedDeliveryDate 
    ? new Date(expectedDeliveryDate) 
    : new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Calculate total amount based on pricing type
  let calculatedTotalAmount = totalAmount;
  if (pricingType === "package" && packagePrice) {
    calculatedTotalAmount = packagePrice;
  } else if (pricingType === "custom_quote" && customQuote?.amount) {
    calculatedTotalAmount = customQuote.amount;
  }

  if (!calculatedTotalAmount || calculatedTotalAmount <= 0) {
    throw new BadRequestError("Total amount must be greater than 0");
  }

  // Calculate amount to pay based on payment type
  let amountToPay = calculatedTotalAmount;
  if (paymentType === "advance" && advancePercentage) {
    amountToPay = (calculatedTotalAmount * advancePercentage) / 100;
  }

  const booking = await Booking.create({
    customer: req.userId,
    artist: artistId,
    service,
    package: packageType || "basic",
    customRequirements,
    projectTitle,
    projectDescription,
    referenceLinks: referenceLinks || [],
    uploadedFiles: uploadedFiles || [],
    expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
    urgency: urgency || "normal",
    revisionCount: {
      requested: 0,
      used: 0,
      limit: revisionCount?.limit || 3,
    },
    emailUpdates: emailUpdates || false,
    pricingType: pricingType || "package",
    packagePrice,
    customQuote: customQuote ? {
      amount: customQuote.amount,
      approved: false,
      requestedAt: new Date(),
    } : undefined,
    paymentType: paymentType || "full",
    advancePercentage: advancePercentage || 50,
    estimatedStartDate,
    artistAvailabilityStatus: "available", // Can be enhanced with actual availability check
    // Legacy fields
    bookingDate: bookingDate ? new Date(bookingDate) : null,
    startTime,
    duration,
    location: location || "Remote",
    notes: notes || projectDescription,
    totalAmount: calculatedTotalAmount,
    amountPaid: 0,
    deliveryDays: artistProfile.deliveryTime,
    status: "pending",
    paymentStatus: "pending",
  });

  // Create notification for artist
  const notificationTargetId = artistProfile ? artistProfile._id : artistId;

  await createNotification(
    Notification,
    notificationTargetId,
    "Artist",
    "new_booking",
    "New Booking Request",
    `You have a new booking request for ${service}`,
    booking._id,
    "Booking"
  );

  res.status(201).json({
    success: true,
    data: booking,
  });
});

/**
 * Get booking by ID
 * @route GET /api/bookings/:id
 */
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("customer", "name email profileImage")
    .populate("artist", "name email profileImage category hourlyRate");

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Check authorization
  const isAuthorized =
    (booking.customer?._id && booking.customer._id.toString() === req.userId.toString()) ||
    (booking.artist?._id && booking.artist._id.toString() === req.userId.toString()) ||
    req.userRole === "admin";

  if (!isAuthorized) {
    throw new ForbiddenError("Not authorized to view this booking");
  }

  res.json({
    success: true,
    data: booking,
  });
});

/**
 * Update booking status
 * @route PATCH /api/bookings/:id/status
 */
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Map old statuses to new statuses for backward compatibility
  const statusMap = {
    "confirmed": "in_progress",
    "declined": "cancelled",
  };
  const newStatus = statusMap[status] || status;

  // Only artist can accept/start work, customer can cancel
  if (req.userRole === "artist" && booking.artist.toString() === req.userId.toString()) {
    if (!["in_progress", "review", "completed", "cancelled"].includes(newStatus)) {
       throw new BadRequestError("Invalid status update for artist");
    }
  } else if (req.userRole === "customer" && booking.customer.toString() === req.userId.toString()) {
    if (newStatus !== "cancelled" && newStatus !== "review") {
      throw new BadRequestError("Customer can only cancel bookings or request review");
    }
  } else if (req.userRole !== "admin") {
    throw new ForbiddenError("Not authorized to update this booking");
  }

  // If moving to in_progress, create chat channel
  if (newStatus === "in_progress") {
    const existingChat = await Chat.findOne({ booking: booking._id });
    if (!existingChat) {
      const newChat = await Chat.create({
        participants: [booking.customer, booking.artist],
        booking: booking._id,
        messages: [],
      });
      booking.chatRoomId = newChat._id;
    }
  }

  booking.status = newStatus;
  await booking.save();

  // Notify the other party
  const recipientId =
    req.userId.toString() === booking.customer.toString()
      ? booking.artist
      : booking.customer;
  
  const recipientRole = 
    req.userId.toString() === booking.customer.toString()
      ? "Artist"
      : "Customer";

  await createNotification(
    Notification,
    recipientId,
    recipientRole,
    "booking_status",
    `Booking ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    `Your booking status has been updated to ${newStatus}`,
    booking._id,
    "Booking"
  );

  res.json({
    success: true,
    data: booking,
  });
});

/**
 * Mark booking as completed
 * @route POST /api/bookings/:id/complete
 */
export const completeBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.artist.toString() !== req.userId.toString() && req.userRole !== "admin") {
    throw new ForbiddenError("Only the artist can mark a booking as completed");
  }

  if (!["in_progress", "review"].includes(booking.status)) {
    throw new BadRequestError("Booking must be in progress or review before completion");
  }

  // Move to review status (customer needs to approve)
  booking.status = "review";
  await booking.save();

  // Notify customer
  await createNotification(
    Notification,
    booking.customer,
    "Customer",
    "booking_review",
    "Booking Ready for Review",
    "Your booking is ready for review. Please review and approve.",
    booking._id,
    "Booking"
  );

  res.json({
    success: true,
    data: booking,
  });
});

/**
 * Request revision
 * @route POST /api/bookings/:id/revision
 */
export const requestRevision = asyncHandler(async (req, res) => {
  const { description } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Only customer can request revision
  if (booking.customer.toString() !== req.userId.toString()) {
    throw new ForbiddenError("Only the customer can request revisions");
  }

  if (booking.status !== "review") {
    throw new BadRequestError("Revisions can only be requested when booking is in review status");
  }

  // Check revision limit
  if (booking.revisionCount.used >= booking.revisionCount.limit) {
    throw new BadRequestError(`Revision limit (${booking.revisionCount.limit}) has been reached`);
  }

  // Add revision request
  booking.revisions.push({
    requestedBy: req.userId,
    description: description || "Please make the requested changes",
    status: "pending",
  });

  booking.revisionCount.used += 1;
  booking.status = "in_progress"; // Move back to in_progress

  await booking.save();

  // Notify artist
  const artistProfile = await Artist.findOne({ userId: booking.artist });
  if (artistProfile) {
    await createNotification(
      Notification,
      artistProfile._id,
      "Artist",
      "revision_requested",
      "Revision Requested",
      `Customer has requested a revision: ${description || "Please review the changes"}`,
      booking._id,
      "Booking"
    );
  }

  res.json({
    success: true,
    data: booking,
    message: `Revision requested (${booking.revisionCount.used}/${booking.revisionCount.limit} used)`,
  });
});

/**
 * Approve booking (final approval)
 * @route POST /api/bookings/:id/approve
 */
export const approveBooking = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Only customer can approve
  if (booking.customer.toString() !== req.userId.toString()) {
    throw new ForbiddenError("Only the customer can approve the booking");
  }

  if (booking.status !== "review") {
    throw new BadRequestError("Booking must be in review status to approve");
  }

  booking.status = "completed";
  booking.finalApproval = {
    approved: true,
    approvedBy: req.userId,
    approvedAt: new Date(),
    notes: notes || "",
  };

  await booking.save();

  // Notify artist
  const artistProfile = await Artist.findOne({ userId: booking.artist });
  if (artistProfile) {
    await createNotification(
      Notification,
      artistProfile._id,
      "Artist",
      "booking_approved",
      "Booking Approved",
      "Your booking has been approved by the customer.",
      booking._id,
      "Booking"
    );
  }

  res.json({
    success: true,
    data: booking,
    message: "Booking approved successfully",
  });
});

/**
 * Cancel booking with refund logic
 * @route POST /api/bookings/:id/cancel
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Check authorization
  const isAuthorized = 
    booking.customer.toString() === req.userId.toString() ||
    booking.artist.toString() === req.userId.toString() ||
    req.userRole === "admin";

  if (!isAuthorized) {
    throw new ForbiddenError("Not authorized to cancel this booking");
  }

  if (["completed", "cancelled"].includes(booking.status)) {
    throw new BadRequestError("Booking is already completed or cancelled");
  }

  // Calculate refund based on cancellation rules
  let refundAmount = 0;
  const cancellationWindow = booking.cancellation?.cancellationWindow || 24; // hours
  const now = new Date();
  const startDate = booking.estimatedStartDate || booking.bookingDate || now;
  const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);

  // Auto-refund for unstarted work
  if (booking.status === "pending" || (booking.status === "in_progress" && hoursUntilStart > cancellationWindow)) {
    refundAmount = booking.amountPaid || booking.totalAmount;
  } else if (booking.status === "in_progress") {
    // Partial refund if work has started
    refundAmount = (booking.amountPaid || booking.totalAmount) * 0.5; // 50% refund
  }

  booking.status = "cancelled";
  booking.cancellation = {
    cancelledBy: req.userId,
    cancelledAt: new Date(),
    reason: reason || "Cancelled by user",
    refundAmount,
    refundStatus: refundAmount > 0 ? "pending" : "rejected",
    cancellationWindow,
  };

  if (refundAmount > 0) {
    booking.amountRefunded = refundAmount;
    booking.paymentStatus = "refunded";
  }

  await booking.save();

  // Notify the other party
  const recipientId =
    req.userId.toString() === booking.customer.toString()
      ? booking.artist
      : booking.customer;
  
  const recipientRole = 
    req.userId.toString() === booking.customer.toString()
      ? "Artist"
      : "Customer";

  const artistProfile = await Artist.findOne({ userId: recipientId });
  const notificationTargetId = artistProfile ? artistProfile._id : recipientId;

  await createNotification(
    Notification,
    notificationTargetId,
    recipientRole,
    "booking_cancelled",
    "Booking Cancelled",
    `Booking has been cancelled. ${refundAmount > 0 ? `Refund of ${refundAmount} will be processed.` : ""}`,
    booking._id,
    "Booking"
  );

  res.json({
    success: true,
    data: booking,
    refundAmount,
    message: refundAmount > 0 
      ? `Booking cancelled. Refund of ${refundAmount} will be processed.`
      : "Booking cancelled.",
  });
});

/**
 * Approve custom quote
 * @route POST /api/bookings/:id/approve-quote
 */
export const approveCustomQuote = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Only customer can approve quote
  if (booking.customer.toString() !== req.userId.toString()) {
    throw new ForbiddenError("Only the customer can approve the quote");
  }

  if (!booking.customQuote || !booking.customQuote.amount) {
    throw new BadRequestError("No custom quote found for this booking");
  }

  if (booking.customQuote.approved) {
    throw new BadRequestError("Quote is already approved");
  }

  booking.customQuote.approved = true;
  booking.customQuote.approvedAt = new Date();
  booking.totalAmount = booking.customQuote.amount;

  await booking.save();

  // Notify artist
  const artistProfile = await Artist.findOne({ userId: booking.artist });
  if (artistProfile) {
    await createNotification(
      Notification,
      artistProfile._id,
      "Artist",
      "quote_approved",
      "Quote Approved",
      "Your custom quote has been approved by the customer.",
      booking._id,
      "Booking"
    );
  }

  res.json({
    success: true,
    data: booking,
    message: "Quote approved successfully",
  });
});

/**
 * Set custom quote (artist)
 * @route POST /api/bookings/:id/set-quote
 */
export const setCustomQuote = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Only artist can set quote
  if (booking.artist.toString() !== req.userId.toString()) {
    throw new ForbiddenError("Only the artist can set a custom quote");
  }

  if (!amount || amount <= 0) {
    throw new BadRequestError("Quote amount must be greater than 0");
  }

  booking.customQuote = {
    amount,
    approved: false,
    requestedAt: new Date(),
  };
  booking.pricingType = "custom_quote";

  await booking.save();

  // Notify customer
  await createNotification(
    Notification,
    booking.customer,
    "Customer",
    "quote_received",
    "Custom Quote Received",
    `Artist has provided a custom quote of ${amount}. Please review and approve.`,
    booking._id,
    "Booking"
  );

  res.json({
    success: true,
    data: booking,
    message: "Custom quote set successfully",
  });
});

/**
 * Check artist availability
 * @route GET /api/bookings/check-availability/:artistId
 */
export const checkArtistAvailability = asyncHandler(async (req, res) => {
  const { artistId } = req.params;
  const { date } = req.query;

  const artistProfile = await Artist.findOne({ userId: artistId });

  if (!artistProfile) {
    throw new NotFoundError("Artist not found");
  }

  // Check if artist has active bookings on the date
  const checkDate = date ? new Date(date) : new Date();
  const existingBookings = await Booking.find({
    artist: artistId,
    status: { $in: ["pending", "in_progress", "review"] },
    $or: [
      { estimatedStartDate: { $lte: checkDate } },
      { bookingDate: { $lte: checkDate } },
    ],
  });

  const isAvailable = existingBookings.length === 0;

  res.json({
    success: true,
    data: {
      available: isAvailable,
      artistId,
      date: checkDate,
      existingBookings: existingBookings.length,
    },
  });
});

/**
 * Get all bookings (with filters)
 * @route GET /api/bookings
 */
export const getBookings = asyncHandler(async (req, res) => {
  const { status, role, customerId, artistId } = req.query;
  const query = {};

  if (req.userRole === "customer") {
    query.customer = req.userId;
  } else if (req.userRole === "artist") {
    query.artist = req.userId;
  } else if (req.userRole === "admin") {
    // Admin can filter by customer or artist
    if (customerId) query.customer = customerId;
    if (artistId) query.artist = artistId;
  } else {
    throw new ForbiddenError("Unauthorized");
  }

  if (status) {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .populate("customer", "name email profileImage")
    .populate("artist", "name email profileImage")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

/**
 * Admin: Get all bookings with filters
 * @route GET /api/bookings/admin/all
 */
export const getAllBookingsAdmin = asyncHandler(async (req, res) => {
  if (req.userRole !== "admin") {
    throw new ForbiddenError("Admin access required");
  }

  const { status, customerId, artistId, startDate, endDate, limit = 50, page = 1 } = req.query;
  const query = {};

  if (status) query.status = status;
  if (customerId) query.customer = customerId;
  if (artistId) query.artist = artistId;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const bookings = await Booking.find(query)
    .populate("customer", "name email profileImage")
    .populate("artist", "name email profileImage")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Booking.countDocuments(query);

  res.json({
    success: true,
    count: bookings.length,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    data: bookings,
  });
});

/**
 * Admin: Force cancel booking
 * @route POST /api/bookings/:id/admin/cancel
 */
export const adminForceCancel = asyncHandler(async (req, res) => {
  if (req.userRole !== "admin") {
    throw new ForbiddenError("Admin access required");
  }

  const { reason, refundAmount } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.status === "completed") {
    throw new BadRequestError("Cannot cancel a completed booking");
  }

  const refund = refundAmount !== undefined ? refundAmount : booking.amountPaid || booking.totalAmount;

  booking.status = "cancelled";
  booking.cancellation = {
    cancelledBy: req.userId,
    cancelledAt: new Date(),
    reason: reason || "Cancelled by admin",
    refundAmount: refund,
    refundStatus: refund > 0 ? "processed" : "rejected",
    cancellationWindow: booking.cancellation?.cancellationWindow || 24,
  };
  booking.amountRefunded = refund;
  if (refund > 0) {
    booking.paymentStatus = "refunded";
  }

  // Add admin note
  booking.adminNotes = booking.adminNotes || [];
  booking.adminNotes.push({
    note: `Force cancelled by admin. Reason: ${reason || "Admin decision"}. Refund: ${refund}`,
    addedBy: req.userId,
    addedAt: new Date(),
  });

  await booking.save();

  // Notify both parties
  await createNotification(
    Notification,
    booking.customer,
    "Customer",
    "booking_cancelled",
    "Booking Cancelled by Admin",
    `Your booking has been cancelled by admin. ${refund > 0 ? `Refund of ${refund} will be processed.` : ""}`,
    booking._id,
    "Booking"
  );

  const artistProfile = await Artist.findOne({ userId: booking.artist });
  if (artistProfile) {
    await createNotification(
      Notification,
      artistProfile._id,
      "Artist",
      "booking_cancelled",
      "Booking Cancelled by Admin",
      `A booking has been cancelled by admin.`,
      booking._id,
      "Booking"
    );
  }

  res.json({
    success: true,
    data: booking,
    message: `Booking force cancelled. Refund: ${refund}`,
  });
});

/**
 * Admin: Process refund
 * @route POST /api/bookings/:id/admin/refund
 */
export const adminProcessRefund = asyncHandler(async (req, res) => {
  if (req.userRole !== "admin") {
    throw new ForbiddenError("Admin access required");
  }

  const { amount, reason } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  const refundAmount = amount || booking.amountPaid || booking.totalAmount;

  if (refundAmount <= 0) {
    throw new BadRequestError("Refund amount must be greater than 0");
  }

  booking.amountRefunded = (booking.amountRefunded || 0) + refundAmount;
  booking.paymentStatus = booking.amountRefunded >= booking.totalAmount ? "refunded" : "partial";

  if (booking.cancellation) {
    booking.cancellation.refundStatus = "processed";
  }

  // Add admin note
  booking.adminNotes = booking.adminNotes || [];
  booking.adminNotes.push({
    note: `Refund processed by admin. Amount: ${refundAmount}. Reason: ${reason || "Admin decision"}`,
    addedBy: req.userId,
    addedAt: new Date(),
  });

  await booking.save();

  // Notify customer
  await createNotification(
    Notification,
    booking.customer,
    "Customer",
    "refund_processed",
    "Refund Processed",
    `A refund of ${refundAmount} has been processed for your booking.`,
    booking._id,
    "Booking"
  );

  res.json({
    success: true,
    data: booking,
    message: `Refund of ${refundAmount} processed successfully`,
  });
});

/**
 * Admin: Resolve dispute
 * @route POST /api/bookings/:id/admin/resolve-dispute
 */
export const adminResolveDispute = asyncHandler(async (req, res) => {
  if (req.userRole !== "admin") {
    throw new ForbiddenError("Admin access required");
  }

  const { decision, refundAmount, notes } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  if (!booking.dispute || booking.dispute.status !== "open") {
    throw new BadRequestError("No open dispute found for this booking");
  }

  booking.dispute.status = "resolved";
  booking.dispute.adminDecision = decision;
  booking.dispute.resolvedAt = new Date();

  // Process refund if decision requires it
  if (refundAmount && refundAmount > 0) {
    booking.amountRefunded = (booking.amountRefunded || 0) + refundAmount;
    booking.paymentStatus = booking.amountRefunded >= booking.totalAmount ? "refunded" : "partial";
  }

  // Add admin note
  booking.adminNotes = booking.adminNotes || [];
  booking.adminNotes.push({
    note: `Dispute resolved by admin. Decision: ${decision}. ${refundAmount ? `Refund: ${refundAmount}.` : ""} Notes: ${notes || ""}`,
    addedBy: req.userId,
    addedAt: new Date(),
  });

  await booking.save();

  // Notify both parties
  await createNotification(
    Notification,
    booking.customer,
    "Customer",
    "dispute_resolved",
    "Dispute Resolved",
    `Your dispute has been resolved. Decision: ${decision}`,
    booking._id,
    "Booking"
  );

  const artistProfile = await Artist.findOne({ userId: booking.artist });
  if (artistProfile) {
    await createNotification(
      Notification,
      artistProfile._id,
      "Artist",
      "dispute_resolved",
      "Dispute Resolved",
      `The dispute has been resolved. Decision: ${decision}`,
      booking._id,
      "Booking"
    );
  }

  res.json({
    success: true,
    data: booking,
    message: "Dispute resolved successfully",
  });
});

/**
 * Admin: Get artist performance tracking
 * @route GET /api/bookings/admin/artist-performance/:artistId
 */
export const getArtistPerformance = asyncHandler(async (req, res) => {
  if (req.userRole !== "admin") {
    throw new ForbiddenError("Admin access required");
  }

  const { artistId } = req.params;
  const { startDate, endDate } = req.query;

  const query = { artist: artistId };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const bookings = await Booking.find(query)
    .populate("customer", "name email")
    .sort({ createdAt: -1 });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    in_progress: bookings.filter(b => b.status === "in_progress").length,
    review: bookings.filter(b => b.status === "review").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
    totalRevenue: bookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    averageRating: 0, // Can be calculated from reviews
    cancellationRate: bookings.length > 0 
      ? (bookings.filter(b => b.status === "cancelled").length / bookings.length) * 100 
      : 0,
    averageCompletionTime: 0, // Can be calculated from completed bookings
  };

  res.json({
    success: true,
    data: {
      artistId,
      stats,
      bookings: bookings.slice(0, 20), // Return last 20 bookings
    },
  });
});
