import AppError from "../utils/AppError.js";

const validation = (schema) => {
  return (req, res, next) => {
    try {
      let validationErrors = [];

      // Validate request body if schema has body validation
      if (schema.body) {
        const bodyValidation = schema.body.validate(req.body, {
          abortEarly: false,
        });
        if (bodyValidation.error) {
          validationErrors.push(...bodyValidation.error.details);
        }
      }

      // Validate URL parameters if schema has params validation
      if (schema.params) {
        const paramsValidation = schema.params.validate(req.params, {
          abortEarly: false,
        });
        if (paramsValidation.error) {
          validationErrors.push(...paramsValidation.error.details);
        }
      }

      // Validate query parameters if schema has query validation
      if (schema.query) {
        const queryValidation = schema.query.validate(req.query, {
          abortEarly: false,
        });
        if (queryValidation.error) {
          validationErrors.push(...queryValidation.error.details);
        }
      }

      // Handle file uploads if present
      if (schema.file && req.file) {
        const fileValidation = schema.file.validate(req.file, {
          abortEarly: false,
        });
        if (fileValidation.error) {
          validationErrors.push(...fileValidation.error.details);
        }
      }

      if (schema.files && req.files) {
        const filesValidation = schema.files.validate(req.files, {
          abortEarly: false,
        });
        if (filesValidation.error) {
          validationErrors.push(...filesValidation.error.details);
        }
      }
      let validate = schema.validate(req.body, { abortEarly: false });
      if (validate.error) {
        return next(new AppError(JSON.stringify(validate.error.details), 422));
      }
      // If any validation errors occurred
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors
          .map((error) => error.message)
          .join(", ");
        return next(new AppError(errorMessages, 400));
      }

      return next();
    } catch (error) {
      return next(
        new AppError(`Validation middleware error: ${error.message}`, 500)
      );
    }
  };
};

export default validation;
// export { HRLoginSchema };
