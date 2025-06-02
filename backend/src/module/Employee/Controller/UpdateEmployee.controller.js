import { asyncHandler } from "../../../utils/asyncHandler.js";
import  employeeModel from '../../../../DB/models/Employee.model.js';


export const updateEmployee = asyncHandler(async (req, res) => {

    const {
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
  } = req.body;
  const updatedEmployee = await employeeModel.findByIdAndUpdate(
    req.params.id,
    {
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
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    data: {
      updatedEmployee,
    },
  })

});
