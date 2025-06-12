import joi from "joi";

let loginSchema = joi.object({
  email: joi.string()
    .required()
    .pattern(new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"))
    .messages({
      "string.empty": "Email is required",
      "string.pattern.base": "Email format is invalid",
      "any.required": "Email is required"
    }),
    
  password: joi.string()
    .required()
    .messages({
      "string.empty": "Password is required",
      "any.required": "Password is required"
    })
});

export default loginSchema;
