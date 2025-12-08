/**
 * Upload Routes
 * Handles image upload endpoints
 */
import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Upload image endpoint (requires authentication)
// POST /api/upload
// Body: FormData with 'image' file and optional 'imageType' field
// imageType options: 'category', 'admin_profile', 'customer_profile', 'artist_profile'
router.post("/", verifyToken, uploadImage);

export default router;

