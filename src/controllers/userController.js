/**
 * User Controller
 * Handles registration, user listings, and profile retrieval
 */
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Artist from "../models/Artist.js";
import Customer from "../models/Customer.js";
import Category from "../models/Category.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../utils/errors.js";
import { asyncHandler } from "../middleware/authMiddleware.js";

/**
 * Register a new user (artist or customer)
 * @route POST /api/users/register
 */
export const registerUser = asyncHandler(async (req, res) => {
  const {
    role,
    name,
    email,
    password,
    phone,
    bio,
    category,
    skills,
    hourlyRate,
    address,
  } = req.body;

  if (!role || !name || !email || !password) {
    throw new BadRequestError("Please provide role, name, email, and password");
  }

  if (role === "admin") {
    throw new BadRequestError("Admin accounts cannot be self-registered.");
  }

  if (role !== "artist" && role !== "customer") {
    throw new BadRequestError(
      "Invalid role. Only 'artist' and 'customer' roles are allowed."
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already exists across all collections
  const [existingAdmin, existingArtist, existingCustomer] = await Promise.all([
    Admin.findOne({ email: normalizedEmail }),
    Artist.findOne({ email: normalizedEmail }),
    Customer.findOne({ email: normalizedEmail }),
  ]);

  if (existingAdmin || existingArtist || existingCustomer) {
    throw new ConflictError("User with this email already exists");
  }

  if (role === "artist") {
    if (!category) {
      throw new BadRequestError("Category is required for artist registration");
    }

    let categoryId = null;
    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryId = category;
    } else {
      const categoryDoc = await Category.findOne({
        name: { $regex: new RegExp(`^${category}$`, "i") },
      });
      if (!categoryDoc) {
        throw new NotFoundError(
          `Category not found. Provide a valid category id or name.`
        );
      }
      categoryId = categoryDoc._id;
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      throw new BadRequestError("Invalid category provided for artist");
    }

    const artist = await Artist.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone,
      bio,
      category: categoryId,
      skills,
      hourlyRate,
    });

    return res.status(201).json({
      success: true,
      message:
        "Artist registered successfully. Please wait for admin approval.",
      data: {
        user: {
          id: artist._id,
          name: artist.name,
          email: artist.email,
          role: artist.role,
          isApproved: artist.isApproved,
        },
      },
    });
  }

  const customer = await Customer.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone,
    address,
    isApproved: true, // Customers are auto-approved
  });

  return res.status(201).json({
    success: true,
    message: "Customer registered successfully. You can now log in.",
    data: {
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        role: customer.role,
        isApproved: customer.isApproved,
      },
    },
  });
});

/**
 * Get all non-admin users with search and filtering
 * @route GET /api/users
 * Query params: search, role, isApproved, isActive, page, limit, sortBy, sortOrder
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const {
    search,
    role,
    isApproved,
    isActive,
    category,
    minRating,
    maxHourlyRate,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build artist query
  const artistQuery = {};
  if (search) {
    artistQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { bio: { $regex: search, $options: "i" } },
      { skills: { $in: [new RegExp(search, "i")] } },
    ];
  }
  if (isApproved !== undefined) {
    artistQuery.isApproved = isApproved === "true";
  }
  if (isActive !== undefined) {
    artistQuery.isActive = isActive === "true";
  }
  if (category) {
    artistQuery.category = category;
  }
  if (minRating) {
    artistQuery.rating = { $gte: parseFloat(minRating) };
  }
  if (maxHourlyRate) {
    artistQuery.hourlyRate = { $lte: parseFloat(maxHourlyRate) };
  }

  // Build customer query
  const customerQuery = {};
  if (search) {
    customerQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (isApproved !== undefined) {
    customerQuery.isApproved = isApproved === "true";
  }
  if (isActive !== undefined) {
    customerQuery.isActive = isActive === "true";
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  let artists = [];
  let customers = [];

  // Fetch based on role filter
  if (!role || role === "artist") {
    artists = await Artist.find(artistQuery)
      .select("-password")
      .populate("category", "name description")
      .skip(role === "artist" ? skip : 0)
      .limit(role === "artist" ? limitNum : 1000)
      .sort(sort);
  }

  if (!role || role === "customer") {
    customers = await Customer.find(customerQuery)
      .select("-password")
      .skip(role === "customer" ? skip : 0)
      .limit(role === "customer" ? limitNum : 1000)
      .sort(sort);
  }

  // Combine and format
  const users = [
    ...artists.map((artist) => ({
      ...artist.toObject(),
      role: "artist",
    })),
    ...customers.map((customer) => ({
      ...customer.toObject(),
      role: "customer",
    })),
  ];

  // If no role filter, apply pagination to combined results
  let paginatedUsers = users;
  let total = users.length;

  if (!role) {
    total = users.length;
    paginatedUsers = users.slice(skip, skip + limitNum);
  } else {
    total =
      role === "artist"
        ? await Artist.countDocuments(artistQuery)
        : await Customer.countDocuments(customerQuery);
  }

  res.json({
    success: true,
    message: "Users retrieved successfully",
    data: paginatedUsers,
    pagination: {
      currentPage: parseInt(page),
      limit: limitNum,
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * Get currently authenticated user profile
 * @route GET /api/users/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});
