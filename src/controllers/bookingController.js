import Booking from "../models/Booking.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { NotFoundError } from "../utils/errors.js";

// Get all bookings with populated customer and artist
export const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate("customer_id", "name email phone")
    .populate(
      "talent_id",
      "name category email phone price_per_service rating"
    );

  res.status(200).json({
    success: true,
    length: bookings.length,
    bookings,
  });
});

// Get a booking by Id with populated data
export const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id)
    .populate("customer_id", "name email phone address")
    .populate(
      "talent_id",
      "name category email phone bio experience price_per_service rating"
    );

  if (!booking) {
    throw new NotFoundError("Booking");
  }

  res.status(200).json({
    success: true,
    booking,
  });
});

// Create a booking
export const createBooking = asyncHandler(async (req, res) => {
  const bookingData = req.body;
  const newBooking = new Booking(bookingData);
  const savedBooking = await newBooking.save();

  // Populate after save
  await savedBooking.populate("customer_id", "name email phone");
  await savedBooking.populate("talent_id", "name category email");

  res.status(201).json({
    success: true,
    message: "Booking created successfully",
    booking: savedBooking,
  });
});

// Update a booking by Id
export const updateBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const booking = await Booking.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("customer_id", "name email phone")
    .populate("talent_id", "name category email");

  if (!booking) {
    throw new NotFoundError("Booking");
  }

  res.status(200).json({
    success: true,
    message: "Booking updated successfully",
    booking,
  });
});

// Delete a booking by Id
export const deleteBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findByIdAndDelete(id);

  if (!booking) {
    throw new NotFoundError("Booking");
  }

  res.status(200).json({
    success: true,
    message: "Booking deleted successfully",
    deletedBooking: booking,
  });
});
