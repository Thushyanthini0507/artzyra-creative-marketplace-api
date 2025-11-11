/**
 * Standard API response utilities
 */

export const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    if (Array.isArray(data)) {
      response.length = data.length;
      response.data = data;
    } else {
      response.data = data;
    }
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message,
  };

  if (error && process.env.NODE_ENV === "development") {
    response.error = error.message;
  }

  return res.status(statusCode).json(response);
};

export const notFoundResponse = (res, resource) => {
  return errorResponse(res, 404, `${resource} not found`);
};

export const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: "Validation error",
    errors,
  });
};




