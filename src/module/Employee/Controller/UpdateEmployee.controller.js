import { asyncHandler } from "../../../utils/asyncHandler.js";
import employeeModel from "../../../../DB/models/Employee.model.js";
import AppError from "../../../utils/AppError.js";

export const updateEmployee = asyncHandler(async (req, res, next) => {
  let {
    user,
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

  const existingEmail = await employeeModel.findOne({
    email,
    _id: { $ne: req.params.id },
  });
  if (existingEmail) {
    return next(new AppError("Email Already exist", 402));
  }
  const existingAddress = await employeeModel.findOne({
    address,
    _id: { $ne: req.params.id },
  });
  if (existingAddress) {
    return next(new AppError("Reapeated Address", 402));
  }
  const existingPhone = await employeeModel.findOne({
    phone,
    _id: { $ne: req.params.id },
  });
  if (existingPhone) {
    return next(new AppError("Phone Already exist", 402));
  }
  const existingNationalId = await employeeModel.findOne({
    nationalId,
    _id: { $ne: req.params.id },
  });
  if (existingNationalId) {
    return next(new AppError("nationalId Already exist", 402));
  }
  const currentYear = new Date().getFullYear();
  const birthYear = new Date(birthdate).getFullYear();
  if (isNaN(birthYear) || birthYear > currentYear - 16) {
    return next(
      new AppError(
        "Birthdate must be at least 16 years before the current year",
        400
      )
    );
  }
  const updateData = {
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
  };

  const updatedEmployee = await employeeModel.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );
  res.status(200).json({
    status: "success",
    data: updatedEmployee,
  });
});
