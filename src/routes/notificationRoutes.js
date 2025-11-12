/**
 * Notification Routes
 * Routes for managing user notifications
 */
import express from "express";
import Notification from "../models/Notification.js";
import { authenticate, checkApproval, asyncHandler } from "../middleware/authMiddleware.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { formatPaginationResponse } from "../utils/paginate.js";

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);
router.use(checkApproval);

/**
 * Get user notifications with pagination
 * @route GET /api/notifications
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { isRead, page = 1, limit = 20 } = req.query;

    const userModel =
      req.userRole === "admin"
        ? "Admin"
        : req.userRole === "artist"
        ? "Artist"
        : "Customer";

    const query = {
      user: req.userId,
      userModel,
    };

    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const notifications = await Notification.find(query)
      .populate("relatedId")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false,
    });

    const response = formatPaginationResponse(notifications, total, page, limit);

    res.json({
      success: true,
      data: {
        notifications: response.data,
        unreadCount,
        pagination: response.pagination,
      },
    });
  })
);

/**
 * Mark notification as read
 * @route PUT /api/notifications/:notificationId/read
 */
router.put(
  "/:notificationId/read",
  asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (notification.user.toString() !== req.userId.toString()) {
      throw new ForbiddenError(
        "You are not authorized to update this notification"
      );
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: "Notification marked as read",
      data: {
        notification,
      },
    });
  })
);

/**
 * Mark all notifications as read
 * @route PUT /api/notifications/read-all
 */
router.put(
  "/read-all",
  asyncHandler(async (req, res) => {
    const userModel =
      req.userRole === "admin"
        ? "Admin"
        : req.userRole === "artist"
        ? "Artist"
        : "Customer";

    await Notification.updateMany(
      {
        user: req.userId,
        userModel,
        isRead: false,
      },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  })
);

/**
 * Delete notification
 * @route DELETE /api/notifications/:notificationId
 */
router.delete(
  "/:notificationId",
  asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (notification.user.toString() !== req.userId.toString()) {
      throw new ForbiddenError(
        "You are not authorized to delete this notification"
      );
    }

    await Notification.findByIdAndDelete(notificationId);

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  })
);

export default router;
