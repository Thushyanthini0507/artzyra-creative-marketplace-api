/**
 * Category Routes
 * Public routes for viewing categories
 * Admin routes for category management
 */
import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getArtistsByCategory,
} from "../controllers/categoryController.js";
import { authenticate, checkApproval } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public routes - View categories (no authentication required)
router.get("/", getAllCategories);
router.get("/:categoryId", getCategoryById);
router.get("/:categoryId/artists", getArtistsByCategory);

// Admin only routes - Category management
router.post("/", authenticate, checkApproval, adminOnly, createCategory);
router.put("/:categoryId", authenticate, checkApproval, adminOnly, updateCategory);
router.delete("/:categoryId", authenticate, checkApproval, adminOnly, deleteCategory);

export default router;
