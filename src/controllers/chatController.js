import Chat from "../models/Chat.js";
import Booking from "../models/Booking.js";
import Artist from "../models/Artist.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { createNotification } from "../utils/helpers.js";
import { asyncHandler } from "../middleware/authMiddleware.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../utils/errors.js";

/**
 * Get all chats for the current user
 * @route GET /api/chats
 */
export const getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    participants: req.userId,
  })
    .populate("participants", "name email profileImage")
    .populate("booking", "service status")
    .sort({ lastMessageTimestamp: -1 });

  res.json({
    success: true,
    data: chats,
  });
});

/**
 * Get chat by ID or Booking ID
 * @route GET /api/chats/:id
 */
export const getChatById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { bookingId } = req.query;

  let chat;

  if (bookingId) {
    chat = await Chat.findOne({
      booking: bookingId,
      participants: req.userId,
    })
      .populate("participants", "name email profileImage")
      .populate("booking", "service status");
  } else {
    chat = await Chat.findOne({
      _id: id,
      participants: req.userId,
    })
      .populate("participants", "name email profileImage")
      .populate("booking", "service status");
  }

  if (!chat) {
    // If searching by bookingId and chat doesn't exist, check if booking exists and user is participant
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking && (booking.customer.toString() === req.userId.toString() || booking.artist.toString() === req.userId.toString())) {
         // Chat doesn't exist yet, return null or create one?
         // For now, return 404, frontend should handle creation or just show empty
         throw new NotFoundError("Chat not found for this booking");
      }
    }
    throw new NotFoundError("Chat not found");
  }

  res.json({
    success: true,
    data: chat,
  });
});

/**
 * Create or get a chat with an artist (for physical artists - direct communication)
 * @route POST /api/chats/create
 */
export const createChatWithArtist = asyncHandler(async (req, res) => {
  const { artistId } = req.body;

  if (!artistId) {
    throw new BadRequestError("Artist ID is required");
  }

  // Verify artist exists (artistId is the Artist document _id, not userId)
  const artistProfile = await Artist.findById(artistId);
  if (!artistProfile) {
    throw new NotFoundError("Artist not found");
  }

  // Get the artist's user ID (from the userId field in Artist model)
  const artistUserId = artistProfile.userId;

  // Prevent chatting with yourself
  if (req.userId.toString() === artistUserId.toString()) {
    throw new BadRequestError("You cannot chat with yourself");
  }

  // Check if chat already exists between these two users
  let chat = await Chat.findOne({
    participants: { $all: [req.userId, artistUserId] },
    booking: { $exists: false }, // Only find chats without bookings
  })
    .populate("participants", "name email profileImage")
    .populate("booking", "service status");

  if (!chat) {
    // Create new chat
    chat = await Chat.create({
      participants: [req.userId, artistUserId],
      messages: [],
      lastMessage: null,
      lastMessageTimestamp: new Date(),
    });

    // Populate the chat
    chat = await Chat.findById(chat._id)
      .populate("participants", "name email profileImage")
      .populate("booking", "service status");
  }

  res.status(201).json({
    success: true,
    data: chat,
  });
});

/**
 * Send a message
 * @route POST /api/chats/:id/messages
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new BadRequestError("Message content is required");
  }

  const chat = await Chat.findOne({
    _id: id,
    participants: req.userId,
  });

  if (!chat) {
    throw new NotFoundError("Chat not found");
  }

  const newMessage = {
    sender: req.userId,
    content,
    timestamp: new Date(),
    read: false,
  };

  chat.messages.push(newMessage);
  chat.lastMessage = content;
  chat.lastMessageTimestamp = newMessage.timestamp;
  await chat.save();

  // Notify the other participant
  const recipientId = chat.participants.find(
    (p) => p.toString() !== req.userId.toString()
  );

  if (recipientId) {
    // We don't know the role easily here without populating, but we can guess or fetch
    // For simplicity, just use "User" or fetch
    // Let's just send a generic notification
    await createNotification(
      Notification,
      recipientId,
      "User", // This might need to be specific if your notification system relies on it
      "new_message",
      "New Message",
      `You have a new message`,
      chat._id,
      "Chat"
    );
  }

  res.status(201).json({
    success: true,
    data: newMessage,
  });
});
