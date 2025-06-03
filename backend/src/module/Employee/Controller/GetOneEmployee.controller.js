import { asyncHandler } from "../../../utils/asyncHandler.js";
import employeeModel from "../../../../DB/models/Employee.model.js";

import mongoose from "mongoose";
import AppError from "../../../utils/AppError.js";

export const getOneEmployee = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid employee ID format" });
  }

  const employee = await employeeModel
    .find({ _id: id, isDeleted: false })
    .lean()

  if (!employee || employee.length == 0) {
    return next(new AppError("Employee not found", 400));
  }

  res.status(200).json({
    success: true,
    data: employee,
  });
});
