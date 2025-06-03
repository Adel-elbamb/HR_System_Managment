import { asyncHandler } from "../../../utils/asyncHandler.js";
import employeeModel from "../../../../DB/models/Employee.model.js";
import AppError from "../../../utils/AppError.js";

export const getDeletedEmployees = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, department, gender, name } = req.query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const query = {};

  if (department) {
    query.department = department;
  }

  if (gender) {
    query.gender = gender;
  }

  if (name) {
    query.$or = [
      { firstName: { $regex: name, $options: "i" } },
      { lastName: { $regex: name, $options: "i" } },
    ];
  }

  const allEmployee = await employeeModel
    .find({ ...query, isDeleted: true })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean()
    .populate("department");

  const count = await employeeModel.countDocuments({
    ...query,
    isDeleted: true,
  });
  if (count == 0) {
    return next(new AppError("Employees not found", 400));
  }
  const totalPages = Math.ceil(count / limitNum);

  res.status(200).json({
    success: true,
    data: allEmployee,
    count,
    currentPage: pageNum,
    totalPages,
  });
});
