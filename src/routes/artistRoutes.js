import express from "express";
import {
  createArtist,
  deleteArtist,
  getAllArtist,
  getArtistById,
  updateArtist,
} from "../controllers/artistController.js";
import {
  registerArtist,
  loginArtist,
  logoutArtist,
  getMeArtist,
  updateArtistPassword,
} from "../controllers/artistAuthController.js";
import { verifyToken, verifyRole } from "../middleware/auth.js";

const ArtistRouter = express.Router();

// Public routes - Authentication
ArtistRouter.post("/register", registerArtist);
ArtistRouter.post("/login", loginArtist);

// Protected routes - Artist profile management
ArtistRouter.post("/logout", verifyToken, verifyRole("Artist"), logoutArtist);
ArtistRouter.get("/me", verifyToken, verifyRole("Artist"), getMeArtist);
ArtistRouter.put(
  "/updatepassword",
  verifyToken,
  verifyRole("Artist"),
  updateArtistPassword
);

// Public route - Get all artists (for browsing)
ArtistRouter.get("/", getAllArtist);

// Public route - Get artist by ID (for viewing profile)
ArtistRouter.get("/:id", getArtistById);

// Admin only routes - Artist management
ArtistRouter.post(
  "/",
  verifyToken,
  verifyRole("Admin", "Super Admin"),
  createArtist
);
ArtistRouter.put(
  "/:id",
  verifyToken,
  verifyRole("Admin", "Super Admin", "Artist"),
  updateArtist
);
ArtistRouter.delete(
  "/:id",
  verifyToken,
  verifyRole("Admin", "Super Admin"),
  deleteArtist
);

export default ArtistRouter;
