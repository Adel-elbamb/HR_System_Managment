export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      error.statusCode = error.statusCode || 500;
      next(error);
    });
  };
};

export const globalError = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  if (req.validationresult) {
    return res
      .status(statusCode)
      .json({ message: error.message, details: req.validationresult.details });
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      message: error.message,
      stack: error.stack,
    });
  }

  return res.status(statusCode).json({ message: error.message });
};
