import { asyncHandler } from "../../../utils/asyncHandler.js";
import  employeeModel from '../../../../DB/models/Employee.model.js';




export const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const employee = await employeeModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  res.status(200).json({
    success: true,
    message: "Employee soft-deleted successfully",
    data: employee,
  });
});
