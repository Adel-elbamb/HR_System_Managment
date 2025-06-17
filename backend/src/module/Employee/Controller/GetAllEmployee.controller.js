import { asyncHandler } from "../../../utils/asyncHandler.js";
import employeeModel from "../../../../DB/models/Employee.model.js";
import departmentModel from "../../../../DB/models/Department.model.js";
import AppError from "../../../utils/AppError.js";

export const getAllEmployee = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, department, gender, name } = req.query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const query = {};

  if (department && department !== 'all') {
    const dept = await departmentModel.findOne({ departmentName: department });
    if (dept) {
      query.department = dept._id;
    } else {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        currentPage: pageNum,
        totalPages: 0,
      });
    }
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
    .find({ ...query, isDeleted: false })
    .populate({ path: "department", select: "departmentName" })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  const count = await employeeModel.countDocuments({
    ...query,
    isDeleted: false,
  });

  const transformedEmployees = allEmployee.map(emp => ({
    ...emp,
    name: `${emp.firstName} ${emp.lastName}`,
    department: emp.department ? emp.department.departmentName : 'N/A',
  }));

  if (count === 0 && (department || gender || name)) {
    return next(new AppError("No Employees Found for the given criteria", 400));
  }
  
  if (count === 0 && (!department && !gender && !name)) {
    return next(new AppError("No Employees Found", 400));
  }

  const totalPages = Math.ceil(count / limitNum);

  res.status(200).json({
    success: true,
    data: transformedEmployees,
    count,
    currentPage: pageNum,
    totalPages,
  });
});
