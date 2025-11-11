import Artist from "../models/artist.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { NotFoundError, UnauthorizedError } from "../utils/errors.js";

// Get all artists
export const getAllArtist = asyncHandler(async (req, res) => {
  const artists = await Artist.find();

  res.status(200).json({
    success: true,
    length: artists.length,
    artists,
  });
});

// Get an artist by Id
export const getArtistById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const artist = await Artist.findById(id);

  if (!artist) {
    throw new NotFoundError("Artist");
  }

  res.status(200).json({
    success: true,
    artist,
  });
});

// Create an artist
export const createArtist = asyncHandler(async (req, res) => {
  const artistData = req.body;
  const newArtist = new Artist(artistData);
  const savedArtist = await newArtist.save();

  res.status(201).json({
    success: true,
    message: "Artist created successfully",
    artist: savedArtist,
  });
});

// Update an artist by Id
export const updateArtist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if artist is updating their own data or is admin
  if (req.user.role === "Artist" && req.user._id.toString() !== id) {
    throw new UnauthorizedError("Not authorized to update this artist's data");
  }

  const updateData = req.body;
  const artist = await Artist.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!artist) {
    throw new NotFoundError("Artist");
  }

  res.status(200).json({
    success: true,
    message: "Artist updated successfully",
    artist,
  });
});

// Delete an artist by Id
export const deleteArtist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const artist = await Artist.findByIdAndDelete(id);

  if (!artist) {
    throw new NotFoundError("Artist");
  }

  res.status(200).json({
    success: true,
    message: "Artist removed successfully",
    deletedArtist: artist,
  });
});
