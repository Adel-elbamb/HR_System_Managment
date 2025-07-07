import Joi from "joi";

export const chatBotSchema = Joi.object({
  question: Joi.string().required().min(3).max(1000).messages({
    "string.empty": "Question cannot be empty",
    "string.min": "Question must be at least 3 characters long",
    "string.max": "Question cannot exceed 1000 characters",
    "any.required": "Question is required",
  }),
});
