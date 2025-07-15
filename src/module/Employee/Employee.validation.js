import Joi from "joi";

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const addEmployeeSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string()
    .email()
    .required()
    .pattern(new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$")),
  phone: Joi.string().required().pattern(new RegExp("^[0-9]{11}$")),
  salary: Joi.number().required().min(6000),
  defaultCheckInTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      required: "check in time is required",
      string: "invalid check in time",
    }),
  defaultCheckOutTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      required: "check out time is required",
      string: "invalid check out time",
    }),
  address: Joi.string().required(),
  gender: Joi.string().required().valid("male", "female"),
  nationality: Joi.string().required(),
  nationalId: Joi.string().length(14).required(),
  birthdate: Joi.string().required(),
  department: Joi.string().required(),
  weekendDays: Joi.array()
    .items(
      Joi.string().valid(
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      )
    )
    .required(),
  overtimeValue: Joi.number().required().min(1),
  deductionValue: Joi.number().required().min(1),
  overtimeType: Joi.string().required().valid("hr", "pound"),
  deductionType: Joi.string().required().valid("hr", "pound"),
});

export const updateEmployeeSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string()
    .email()
    .pattern(new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$")),
  phone: Joi.string().pattern(new RegExp("^[0-9]{11}$")),
  salary: Joi.number(),
  defaultCheckInTime: Joi.number(),
  defaultCheckOutTime: Joi.number(),
  address: Joi.string(),
  gender: Joi.string().valid("male", "female"),
  nationality: Joi.string(),
  nationalId: Joi.string().length(14),
  birthdate: Joi.date(),
  department: Joi.string(),
  weekendDays: Joi.array().items(
    Joi.string().valid(
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    )
  ),
  overtimeValue: Joi.number(),
  deductionValue: Joi.number(),
  overtimeType: Joi.string().required().valid("hr", "pound"),
  deductionType: Joi.string().required().valid("hr", "pound"),
});

export const deleteIdSchema = Joi.object({
  productId: Joi.string().custom(objectIdValidator).required(),
});
