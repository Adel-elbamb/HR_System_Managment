import { asyncHandler } from "../../../utils/asyncHandler.js";
import employeeModel from "../../../../DB/models/Employee.model.js";

export const restoreEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const employee = await employeeModel.findByIdAndUpdate(
    id,
    { isDeleted: false },
    { new: true }
  );

  if (!employee) {
    return next(new AppError("Employee not found", 400));
  }

  res.status(200).json({
    success: true,
    message: "Employee restored successfully",
    data: employee,
  });
});
