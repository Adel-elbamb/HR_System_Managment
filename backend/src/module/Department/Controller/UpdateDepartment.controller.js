import mongoose from "mongoose";
import Department from "../../../../DB/models/Department.model.js";
import AppError from "../../../utils/AppError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { updateDepartmentValidation } from "../Department.validation.js";
import { checkDuplicateDepartment } from "./CheckDuplicateDepartment.js";

export const updateDepartment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid department ID format", 400));
  }

  const { error } = updateDepartmentValidation.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const department = await Department.findById(id);
  if (!department) {
    return next(new AppError("Department Not Found", 404));
  }

  const { departmentName } = req.body;

  if (departmentName && departmentName !== department.departmentName) {
    const duplicate = await checkDuplicateDepartment(departmentName, id);
    if (duplicate) {
      return next(
        new AppError("Department with this name already exists", 409)
      );
    }
    department.departmentName = departmentName;
  }

  await department.save();

  return res.status(200).json({
    success: true,
    message: "Department Updated Successfully",
    data: department,
    timestamp: new Date().toISOString(),
  });
});
