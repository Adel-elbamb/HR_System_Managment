import { asyncHandler } from "../../../utils/asyncHandler.js";
// import employeeModel from "../../../DB/models/Employee.model.js";
import employeeModel from "../../../../DB/models/Employee.model.js";
import departmentModel from "../../../../DB/models/Department.model.js"

export const addEmployee = asyncHandler(async (req, res, next) => {
  let {
    firstName,
    lastName,
    email,
    phone,
    salary,
    address,
    defaultCheckInTime,
    defaultCheckOutTime,
    gender,
    nationality,
    birthdate,
    department,
    weekendDays,
    overtimeValue,
    overtimeType,
    deductionValue,
    deductionType,
  } = req.body;
  const salaryPerHour =
    salary / (defaultCheckOutTime - defaultCheckInTime) / 30;
  if (overtimeType == "hr") {
    overtimeValue = overtimeValue * salaryPerHour;
  }
  if (deductionType == "hr") {
    deductionValue = deductionValue * salaryPerHour;
  }
  const employee = new employeeModel({
    firstName,
    lastName,
    email,
    phone,
    salary,
    address,
    defaultCheckInTime,
    defaultCheckOutTime,
    gender,
    nationality,
    birthdate,
    department,
    weekendDays,
    overtimeValue,
    deductionValue,
    salaryPerHour,
  });
  await employee.save();
  res.status(201).json({
    status: "Success",
    data: employee,
  });
});
