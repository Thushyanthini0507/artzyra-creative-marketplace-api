import express from "express";
import {
  createService,
  deleteService,
  getAllService,
  getServiceById,
  updateService,
} from "../controllers/serviceController.js";
import { verifyToken, verifyRole } from "../middleware/auth.js";

const ServiceRouter = express.Router();

// All service routes require admin access
// Services are managed by admins only

// Get all services - Public (can be viewed by anyone for browsing)
ServiceRouter.get("/", getAllService);

// Get service by ID - Public (can be viewed by anyone)
ServiceRouter.get("/:id", getServiceById);

// Admin only routes - Service management
ServiceRouter.post("/", verifyToken, verifyRole("Admin", "Super Admin"), createService);
ServiceRouter.put("/:id", verifyToken, verifyRole("Admin", "Super Admin"), updateService);
ServiceRouter.delete("/:id", verifyToken, verifyRole("Admin", "Super Admin"), deleteService);

export default ServiceRouter;
