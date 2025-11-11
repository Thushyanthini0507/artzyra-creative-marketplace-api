import Artist from "../models/artist.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ConflictError,
} from "../utils/errors.js";

/**
 * @desc    Register new artist
 * @route   POST /api/artists/register
 * @access  Public
 */
export const registerArtist = asyncHandler(async (req, res) => {
  const {
    talent_id,
    name,
    email,
    password,
    phone,
    category,
    bio,
    experience,
    portfolio_link,
    price_per_service,
  } = req.body;

  // Validation
  if (
    !talent_id ||
    !name ||
    !email ||
    !password ||
    !phone ||
    !category ||
    !price_per_service
  ) {
    throw new BadRequestError("Please provide all required fields");
  }

  // Check if artist already exists
  const artistExists = await Artist.findOne({ email });
  if (artistExists) {
    throw new ConflictError("Artist already exists with this email");
  }

  // Check if talent_id already exists
  const talentIdExists = await Artist.findOne({ talent_id });
  if (talentIdExists) {
    throw new ConflictError("Talent ID already exists");
  }

  // Create artist
  const artist = await Artist.create({
    talent_id,
    name,
    email,
    password,
    phone,
    category,
    bio,
    experience,
    portfolio_link,
    price_per_service,
    status: "Active",
  });

  // Generate token
  const token = artist.getSignedJwtToken();

  res.status(201).json({
    success: true,
    message: "Artist registered successfully",
    token,
    artist: {
      id: artist._id,
      talent_id: artist.talent_id,
      name: artist.name,
      email: artist.email,
      category: artist.category,
      phone: artist.phone,
      status: artist.status,
    },
  });
});

/**
 * @desc    Login artist
 * @route   POST /api/artists/login
 * @access  Public
 */
export const loginArtist = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  // Check for artist and include password (since it's select: false)
  const artist = await Artist.findOne({ email }).select("+password");

  if (!artist) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Check if password matches
  const isMatch = await artist.matchPassword(password);

  if (!isMatch) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Generate token
  const token = artist.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    artist: {
      id: artist._id,
      talent_id: artist.talent_id,
      name: artist.name,
      email: artist.email,
      category: artist.category,
      phone: artist.phone,
      status: artist.status,
    },
  });
});

/**
 * @desc    Get current logged in artist
 * @route   GET /api/artists/me
 * @access  Private/Artist
 */
export const getMeArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findById(req.user._id);

  if (!artist) {
    throw new NotFoundError("Artist");
  }

  res.status(200).json({
    success: true,
    artist,
  });
});

/**
 * @desc    Update artist password
 * @route   PUT /api/artists/updatepassword
 * @access  Private/Artist
 */
export const updateArtistPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new BadRequestError("Please provide current and new password");
  }

  // Get artist with password
  const artist = await Artist.findById(req.user._id).select("+password");

  if (!artist) {
    throw new NotFoundError("Artist");
  }

  // Check current password
  if (!(await artist.matchPassword(currentPassword))) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  // Update password
  artist.password = newPassword;
  await artist.save();

  // Generate new token
  const token = artist.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
    token,
  });
});

/**
 * @desc    Logout artist
 * @route   POST /api/artists/logout
 * @access  Private
 */
export const logoutArtist = asyncHandler(async (req, res) => {
  // Since JWT is stateless, logout is handled client-side by removing the token
  // This endpoint provides a consistent API and can be used for logging/logout events

  res.status(200).json({
    success: true,
    message:
      "Logged out successfully. Please remove the token from client storage.",
  });
});
