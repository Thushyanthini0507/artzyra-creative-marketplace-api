/**
 * Artist Public Controller
 * Provides read-only access to approved artist data
 */
import mongoose from "mongoose";
import Artist from "../models/Artist.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";
import { asyncHandler } from "../middleware/authMiddleware.js";

/**
 * Get approved artists with search and filtering
 * @route GET /api/artists
 * @access Public
 * Query params: category, search, page, limit
 * 
 * EXPLANATION:
 * - category: Filter by category ID
 * - search: Searches in name, bio, and skills fields (case-insensitive)
 * - page, limit: Pagination parameters
 * - Returns only approved and active artists
 */
export const getArtists = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;

  // Base query - only approved and active artists
  const query = { isApproved: true, isActive: true };

  // CATEGORY FILTER
  // Filter artists by specific category
  // Example: ?category=69159852bcea8d9de167502f
  // Validates that category ID is a valid MongoDB ObjectId
  if (category) {
    // Validate MongoDB ObjectId format (24 hex characters)
    if (!mongoose.Types.ObjectId.isValid(category)) {
      throw new BadRequestError("Invalid category id");
    }
    query.category = category;
  }

  // SEARCH FILTER
  // Searches across multiple fields using $or operator
  // - name: Artist name
  // - bio: Artist biography
  // - skills: Skills array (uses $in with RegExp for array search)
  // Example: ?search=photography
  // Will match artists with "photography" in name, bio, or skills
  if (search) {
    const regex = new RegExp(search, "i"); // Case-insensitive regex
    query.$or = [
      { name: regex },
      { bio: regex },
      { skills: regex }, // Searches in skills array
    ];
  }

  // PAGINATION CALCULATION
  // Ensure page is at least 1, limit is between 1-100
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  // EXECUTE QUERY
  // Use Promise.all to run query and count in parallel for better performance
  const [artists, total] = await Promise.all([
    Artist.find(query)
      .select("-password")
      .populate("category", "name description")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }), // Sort by newest first
    Artist.countDocuments(query), // Get total count for pagination
  ]);

  // RESPONSE
  res.json({
    success: true,
    message: "Artists retrieved successfully",
    data: artists,
    pagination: {
      currentPage: pageNum,
      limit: limitNum,
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: skip + artists.length < total,
      hasPrevPage: pageNum > 1,
    },
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
