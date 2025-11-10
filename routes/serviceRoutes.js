import express from "express";
import {
  createService,
  deleteService,
  getAllService,
  getServiceById,
  updateService,
} from "../controllers/serviceController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const ServiceRouter = express.Router();

// All service routes require admin access
ServiceRouter.get("/", protect, adminOnly, getAllService);
ServiceRouter.get("/:id", protect, adminOnly, getServiceById);
ServiceRouter.post("/", protect, adminOnly, createService);
ServiceRouter.put("/:id", protect, adminOnly, updateService);
ServiceRouter.delete("/:id", protect, adminOnly, deleteService);

export default ServiceRouter;
