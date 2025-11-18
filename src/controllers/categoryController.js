/**
 * Category Controller
 * Handles category CRUD operations and artist filtering by category
 */
import Category from "../models/Category.js";
import Artist from "../models/Artist.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";
import { asyncHandler } from "../middleware/authMiddleware.js";

/**
 * Get all categories
 * @route GET /api/categories
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .sort({ name: 1 });

  res.json({
    success: true,
    data: categories,
  });
});

/**
 * Get category by ID
 * @route GET /api/categories/:categoryId
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new NotFoundError("Category not found");
  }

  res.json({
    success: true,
    data: {
      category,
    },
  });
});

/**
 * Create category (Admin only)
 * @route POST /api/categories
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

  if (!name) {
    throw new BadRequestError("Please provide a category name");
  }

  const category = await Category.create({
    name,
    description,
    image,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: {
      category,
    },
  });
});
/**
 * Update category (Admin only)
 * @route PUT /api/categories/:categoryId
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name, description, image, isActive } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (image !== undefined) updateData.image = image;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: "Category updated successfully",
    data: {
      category: updatedCategory,
    },
  });
});

/**
 * Delete category (Admin only)
 * @route DELETE /api/categories/:categoryId
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new NotFoundError("Category not found");
  }

  // Check if category is used by any artists
  const artistsCount = await Artist.countDocuments({ category: categoryId });
  if (artistsCount > 0) {
    throw new BadRequestError(
      `Cannot delete category. It is used by ${artistsCount} artist(s).`
    );
  }

  await Category.findByIdAndDelete(categoryId);

  res.json({
    success: true,
    message: "Category deleted successfully",
  });
});

/**
 * Get artists by category
 * @route GET /api/categories/:categoryId/artists
 */
export const getArtistsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const artists = await Artist.find({
    category: categoryId,
    isApproved: true,
    isActive: true,
  })
    .select("-password")
    .populate("category", "name description image")
    .sort({ rating: -1, createdAt: -1 });

  res.json({
    success: true,
    data: artists,
  });
});

