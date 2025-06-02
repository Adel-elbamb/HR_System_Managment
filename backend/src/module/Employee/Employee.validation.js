import AppError from "../../../utils/AppError.js";
const Joi = require("joi");

const addEmployeeSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required().pattern(new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")),
    phone: Joi.string().required().pattern(new RegExp("^[0-9]{10}$")),
    salary: Joi.number().required(),
    defaultCheckInTime: Joi.number().required(),
    defaultCheckOutTime: Joi.number().required(),
    gender: Joi.string().required().valid("male", "female"),
    nationality: Joi.string().required(),
    birthdate: Joi.date().required(),
    department: Joi.string().required(),
    weekendDays: Joi.array().items(Joi.string()).required(),
})

