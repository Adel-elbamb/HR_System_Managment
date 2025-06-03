class AppError extends Error {
  constructor(message, statusCode, options = {}) {
    super(message);
    this.statusCode = statusCode;

    this.type = options.type || "generic";

    if (options.details) {
      this.details = options.details;
    }
    // Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
