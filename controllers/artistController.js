import Artist from "../models/artist.js";

// Get all artist
export const getAllArtist = async (req, res) => {
  try {
    const artists = await Artist.find();

    res.status(200).json({
      length: artists.length,
      artists,
    });
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};

// Get a artist by Id
export const getArtistById = async (req, res) => {
  try {
    const artistId = req.params.id;
    const artist = await Artist.findById({ _id: itemId });

    if (!artist) return res.status(404).json({ Message: "Artist not found" });

    res.status(200).json(artist);
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};

// Create a artist
export const createArtist = async (req, res) => {
  try {
    const newArtist = new Artist(req.body);

    const savedArtist = await newArtist.save();
    res.status(200).json({
      Message: "Artist created successfully",
      Artist: savedArtist,
    });
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};

// Update a artist by Id
export const updateArtist = async (req, res) => {
  try {
    const itemId = req.params.id;
    const itemExist = await Artist.findById({ _id: itemId });
    if (!itemExist) return res.status(404).json({ Error: "artist not found" });

    const updatedArtist = await Artist.findByIdAndUpdate(itemId, req.body, {
      new: true,
    });
    res.status(200).json({
      Message: "Artist updated successfully",
      Artist: updatedArtist,
    });
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};

// Delete a artist by Id
export const deleteArtist = async (req, res) => {
  try {
    const itemId = req.params.id;
    const artist = await Artist.findByIdAndDelete(itemId);
    if (!artist) return res.status(404).json({ Message: "Artist not found" });
    res.status(200).json({
      Message: "Artist removed successfully",
      deletedArtist: artist,
    });
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};
