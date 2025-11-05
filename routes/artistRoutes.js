import express from "express";
import {
  createArtist,
  deleteArtist,
  getAllArtist,
  getArtistById,
  updateArtist,
} from "../controllers/artistController.js";

const ArtistRouter = express.Router();

ArtistRouter.get("/", getAllArtist);
ArtistRouter.get("/:id", getArtistById);
ArtistRouter.post("/", createArtist);
ArtistRouter.put("/:id", updateArtist);
ArtistRouter.delete("/:id", deleteArtist);

export default ArtistRouter;
