import express from "express";
import {
  getChats,
  getChatById,
  sendMessage,
  createChatWithArtist,
} from "../controllers/chatController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getChats);
router.post("/create", createChatWithArtist); // Must be before /:id to avoid route conflicts
router.get("/:id", getChatById);
router.post("/:id/messages", sendMessage);

export default router;
