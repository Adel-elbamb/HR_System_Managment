import joi from "joi";
import mongoose from "mongoose";

export const addAttendanceSchema = joi.object({
  employeeId: joi
    .string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("invalid");
      }
      return value;
    })
    .messages({
      invalid: "invalid employee id",
      required: "employee id is required",
    }),
  checkInTime: joi
    .string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      required: "check in time is required",
      string: "invalid check in time",
    }),
  checkOutTime: joi
    .string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      required: "check out time is required",
      string: "invalid check out time",
    }),
  lateDurationInHours: joi.number().optional().messages({
    required: "late duration is required",
    number: "invalid late duration",
  }),
  overtimeDurationInHours: joi.number().optional().messages({
    required: "overtime duration is required",
    number: "invalid overtime duration",
  }),

  status: joi.string().valid("present", "absent", "On Leave").required(),
});

export const updateAttendanceSchema = joi.object({
  employeeId: joi
    .string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("invalid");
      }
      return value;
    })
    .messages({
      invalid: "invalid employee id",
      required: "employee id is required",
    }),
  checkInTime: joi
    .string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .messages({
      required: "check in time is required",
      string: "invalid check in time",
    }),
  checkOutTime: joi
    .string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .messages({
      required: "check out time is required",
      string: "invalid check out time",
    }),
  lateDurationInHours: joi.number().optional().messages({
    required: "late duration is required",
    number: "invalid late duration",
  }),
  overtimeDurationInHours: joi.number().optional().messages({
    required: "overtime duration is required",
    number: "invalid overtime duration",
  }),

  status: joi.string().valid("present", "absent", "On Leave"),
});
