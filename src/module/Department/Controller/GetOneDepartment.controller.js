import mongoose from "mongoose";
import Department from "../../../../DB/models/Department.model.js";
import AppError from "../../../utils/AppError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

export const getDepartmentById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid department ID format", 400));
  }

  const department = await Department.findById(id);
  if (!department) {
    return next(new AppError("Department Not Found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "Department Fetched Successfully",
    data: department,
    timestamp: new Date().toISOString(),
  });
});
