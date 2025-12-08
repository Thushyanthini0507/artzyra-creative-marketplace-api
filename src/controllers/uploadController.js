/**
 * Upload Controller
 * Handles image uploads to Cloudinary with folder organization
 */
import { asyncHandler } from "../middleware/authMiddleware.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { BadRequestError } from "../utils/errors.js";
import multer from "multer";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new BadRequestError("Only image files are allowed"), false);
    }
  },
});

/**
 * Upload image endpoint
 * @route POST /api/upload
 * @body {File} image - Image file
 * @body {string} imageType - Type of image: 'category', 'admin_profile', 'customer_profile', 'artist_profile'
 */
export const uploadImage = asyncHandler(async (req, res) => {
  // Handle file upload with multer
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || "File upload failed",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided",
      });
    }

    try {
      // Get image type from request body or query, default to 'category'
      const imageType = req.body.imageType || req.query.imageType || "category";

      // Validate image type
      const validTypes = ["category", "admin_profile", "customer_profile", "artist_profile"];
      if (!validTypes.includes(imageType)) {
        return res.status(400).json({
          success: false,
          error: `Invalid image type. Must be one of: ${validTypes.join(", ")}`,
        });
      }

      // Upload to Cloudinary with folder organization
      const result = await uploadToCloudinary(req.file.buffer, imageType, {
        mimeType: req.file.mimetype,
      });

      res.json({
        success: true,
        data: {
          url: result.url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to upload image",
      });
    }
  });
});

