import { asyncHandler } from "../../../utils/asyncHandler.js";
import employeeModel from "../../../../DB/models/Employee.model.js";

export const updateEmployee = asyncHandler(async (req, res) => {
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
