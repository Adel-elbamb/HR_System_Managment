import mongoose from "mongoose";
import Department from "../../../../DB/models/Department.model.js";
import AppError from "../../../utils/AppError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { queryValidation } from "../Department.validation.js";

export const getAllDepartments = asyncHandler(async (req, res, next) => {
  const { error, value } = queryValidation.validate(req.query);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { page, limit, sortBy, sortOrder, search } = value;
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.departmentName = { $regex: search, $options: "i" };
  }

  const [departments, total] = await Promise.all([
    Department.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit),
    Department.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    message: "Departments Fetched Successfully",
    data: departments,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    timestamp: new Date().toISOString(),
  });
});
