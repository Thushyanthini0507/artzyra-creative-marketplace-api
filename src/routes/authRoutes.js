import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updatePassword,
} from "../controllers/authController.js";
import { verifyToken, verifyRole } from "../middleware/auth.js";

const userRouter = express.Router();

// Public routes
userRouter.post("/login", login);
userRouter.post("/register", register); // Public for first user, protected for admins (handled in controller)

// Protected routes (require authentication - Admin only)
userRouter.post("/logout", verifyToken, verifyRole("Admin", "Super Admin"), logout);
userRouter.get("/me", verifyToken, verifyRole("Admin", "Super Admin"), getMe);
userRouter.put("/updatepassword", verifyToken, verifyRole("Admin", "Super Admin"), updatePassword);

// Admin only routes - User management
userRouter.get("/", verifyToken, verifyRole("Admin", "Super Admin"), getAllUsers);
userRouter.get("/:id", verifyToken, verifyRole("Admin", "Super Admin"), getUserById);
userRouter.put("/:id", verifyToken, verifyRole("Admin", "Super Admin"), updateUser);

// Super Admin only routes
userRouter.delete("/:id", verifyToken, verifyRole("Super Admin"), deleteUser);

export default userRouter;
