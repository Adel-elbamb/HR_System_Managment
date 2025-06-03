import { asyncHandler } from "../../../utils/asyncHandler.js";
import employeeModel from "../../../../DB/models/Employee.model.js";
import AppError from "../../../utils/AppError.js";

export const deleteEmployee = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const employee = await employeeModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  if (!employee) {
    return next(new AppError("Employee not found", 400));
  }

  res.status(200).json({
    success: true,
    message: "Employee soft-deleted successfully",
    data: employee,
  });
});
