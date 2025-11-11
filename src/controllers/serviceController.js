import Service from "../models/service.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { NotFoundError } from "../utils/errors.js";

// Get all services
export const getAllService = asyncHandler(async (req, res) => {
  const services = await Service.find();

  res.status(200).json({
    success: true,
    length: services.length,
    services,
  });
});

// Get a service by Id
export const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const service = await Service.findById(id);

  if (!service) {
    throw new NotFoundError("Service");
  }

  res.status(200).json({
    success: true,
    service,
  });
});

// Create a service
export const createService = asyncHandler(async (req, res) => {
  const serviceData = req.body;
  const newService = new Service(serviceData);
  const savedService = await newService.save();

  res.status(201).json({
    success: true,
    message: "Service created successfully",
    service: savedService,
  });
});

// Update a service by Id
export const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const service = await Service.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!service) {
    throw new NotFoundError("Service");
  }

  res.status(200).json({
    success: true,
    message: "Service updated successfully",
    service,
  });
});

// Delete a service by Id
export const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const service = await Service.findByIdAndDelete(id);

  if (!service) {
    throw new NotFoundError("Service");
  }

  res.status(200).json({
    success: true,
    message: "Service removed successfully",
    deletedService: service,
  });
});
