/**
 * Artist Public Controller
 * Provides read-only access to approved artist data
 */
import Artist from "../models/Artist.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";
import { asyncHandler } from "../middleware/authMiddleware.js";

/**
 * Get approved artists
 * @route GET /api/artists
 * @access Public
 */
export const getArtists = asyncHandler(async (req, res) => {
  const artists = await Artist.find({ isApproved: true, isActive: true })
    .select("-password")
    .populate("category", "name description")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    message: "Artists retrieved successfully",
    data: artists,
  });
});

/**
 * Get approved artist by ID
 * @route GET /api/artists/:id
 * @access Public
 */
export const getArtistById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new BadRequestError("Invalid artist id");
  }

  const artist = await Artist.findOne({
    _id: id,
    isApproved: true,
    isActive: true,
  })
    .select("-password")
    .populate("category", "name description");

  if (!artist) {
    throw new NotFoundError("Artist");
  }

  res.json({
    success: true,
    message: "Artist retrieved successfully",
    data: artist,
  });
});
