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
  function getHourDecimal(timeStr, type = "in") {
    if (!timeStr) return 0;
    const [h, m = 0, s = 0] = timeStr.split(":").map(Number);
    let hour = h;
    if (type === "out" && hour < 8) {
      // Assume check-out in PM if hour < 8
      hour += 12;
    }
    return hour + m / 60 + s / 3600;
  }

  const checkIn = getHourDecimal(defaultCheckInTime, "in");
  const checkOut = getHourDecimal(defaultCheckOutTime, "out");
  const hoursWorked = checkOut - checkIn;
  const workingHoursPerDay = checkOut - checkIn;
  let salaryPerHour = 0;
  if (
    typeof salary === "number" &&
    !isNaN(salary) &&
    salary > 0 &&
    hoursWorked > 0
  ) {
    salaryPerHour = salary / (hoursWorked * 30);
  }
  salaryPerHour = Number(salaryPerHour);
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
  const currentYear = new Date().getFullYear();
  const birthYear = new Date(birthdate).getFullYear();
  if (isNaN(birthYear) || birthYear > currentYear - 16) {
    return next(new AppError("Birthdate must be at least 16 years before the current year", 400));
  }
  const employee = new employeeModel({
    firstName,
    lastName,
    email,
    phone,
    salary,
    workingHoursPerDay,
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
