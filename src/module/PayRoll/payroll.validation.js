import Joi from "joi";
import mongoose from "mongoose";

export const addPayrollSchema = Joi.object({
  employeeId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation")
    .messages({
      "any.invalid": "Employee ID must be a valid ObjectId"
    }),

  month: Joi.date().required(),

  monthDays: Joi.number()
    .required()
    .min(1)
    .max(31)
    .messages({
      "number.min": "Month days must be at least 1",
      "number.max": "Month days cannot exceed 31",
    }),

  attendedDays: Joi.number().min(0).default(0),
  absentDays: Joi.number().min(0).default(0),
  totalOvertime: Joi.number().min(0).default(0),
  totalBonusAmount: Joi.number().min(0).default(0),
  totalDeduction: Joi.number().min(0).default(0),
  totalDeductionAmount: Joi.number().min(0).default(0),

  netSalary: Joi.number().min(0),
}).custom((obj, helpers) => {
  if ((obj.attendedDays + obj.absentDays) > obj.monthDays) {
    return helpers.message("Attended + Absent days cannot exceed monthDays");
  }
  return obj;
});


export const updatePayrollSchema = Joi.object({
  employeeId: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation")
    .messages({
      "any.invalid": "Employee ID must be a valid ObjectId"
    }),

  month: Joi.date().optional(),

  monthDays: Joi.number()
    .min(1)
    .max(31)
    .optional()
    .messages({
      "number.min": "Month days must be at least 1",
      "number.max": "Month days cannot exceed 31",
    }),

  attendedDays: Joi.number().min(0).optional(),
  absentDays: Joi.number().min(0).optional(),
  totalOvertime: Joi.number().min(0).optional(),
  totalBonusAmount: Joi.number().min(0).optional(),
  totalDeduction: Joi.number().min(0).optional(),
  totalDeductionAmount: Joi.number().min(0).optional(),

  netSalary: Joi.number().min(0).optional(),
}).custom((obj, helpers) => {
  if (
    obj.monthDays !== undefined &&
    obj.attendedDays !== undefined &&
    obj.absentDays !== undefined &&
    (obj.attendedDays + obj.absentDays > obj.monthDays)
  ) {
    return helpers.message("Attended + Absent days cannot exceed monthDays");
  }
  return obj;
});