import Joi from "joi";
import { generalfields } from "./../../utils/generalfields.js";
export const createHolidaySchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    "string.empty": "Holiday name is required",
    "string.min": "Holiday name must be at least 2 characters",
  }),
  date: Joi.date().required().messages({
    "date.base": "Holiday date must be a valid date",
    "any.required": "Holiday date is required",
  }),
});

export const updateHolidaySchema = Joi.object({
  // id : generalfields.id ,
  name: Joi.string().trim().min(2).optional(),
  date: Joi.date().optional(),
});

export const deleteHolidaySchema = Joi.object({
  id: generalfields.id,
});
