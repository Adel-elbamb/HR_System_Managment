import { asyncHandler } from "../../../utils/asyncHandler.js";
// import employeeModel from "../../../DB/models/Employee.model.js";
import employeeModel from "../../../../DB/models/Employee.model.js";
import departmentModel from "../../../../DB/models/Department.model.js";
import AppError from "../../../utils/AppError.js";

export const addEmployee = asyncHandler(async (req, res, next) => {
  let {
    firstName,
    lastName,
    email, /////////
    phone, ///////////
    salary,
    address, ///////////
    defaultCheckInTime,
    defaultCheckOutTime,
    gender,
    nationality,
    nationalId, /////////
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
  const existingEmail = await employeeModel.findOne({ email });
  if (existingEmail) {
    return next(new AppError("Email Already exist", 402));
  }
  const existingAddress = await employeeModel.findOne({ address });
  if (existingAddress) {
    return next(new AppError("Reapeated Address", 402));
  }
  const existingPhone = await employeeModel.findOne({ phone });
  if (existingPhone) {
    return next(new AppError("Phone Already exist", 402));
  }
  const existingNationalId = await employeeModel.findOne({ nationalId });
  if (existingNationalId) {
    return next(new AppError("nationalId Already exist", 402));
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
    nationalId,
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
