import attendanceModel from "../../../../DB/models/Attendence.model.js";
import employeeModel from "../../../../DB/models/Employee.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import AppError from "../../../utils/AppError.js";

import moment from "moment";
const parseTimeToDate = (timeString, dateObj) => {
  const dateStr = moment(dateObj).format("YYYY-MM-DD");
  return moment(`${dateStr} ${timeString}`, [
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DD HH:mm",
  ]).toDate();
};

export const updateAttendance = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { checkInTime, checkOutTime, status } = req.body;
  const attendance = await attendanceModel.findById(id);
  if (!attendance) {
    return next(new AppError("Attendance not found", 404));
  }
  const employee = await employeeModel.findById(attendance.employeeId);
  if (!employee) {
    return next(new AppError("Employee not found", 404));
  }

  let lateDurationInHours = 0;
  let overtimeDurationInHours = 0;

  if (checkInTime && status === "present") {
    const defaultCheckIn = parseTimeToDate(
      employee.defaultCheckInTime || "09:00:00",
      attendance.date
    );
    const actualCheckIn = parseTimeToDate(checkInTime, attendance.date);
    if (actualCheckIn > defaultCheckIn) {
      lateDurationInHours += moment(actualCheckIn).diff(
        defaultCheckIn,
        "hours",
        true
      );
    } else if (actualCheckIn < defaultCheckIn) {
      overtimeDurationInHours += moment(defaultCheckIn).diff(
        actualCheckIn,
        "hours",
        true
      );
    }
  }
  if (checkOutTime && status === "present") {
    const defaultCheckOut = parseTimeToDate(
      employee.defaultCheckOutTime || "17:00:00",
      attendance.date
    );
    const actualCheckOut = parseTimeToDate(checkOutTime, attendance.date);
    if (actualCheckOut < defaultCheckOut) {
      lateDurationInHours += moment(defaultCheckOut).diff(
        actualCheckOut,
        "hours",
        true
      );
    } else if (actualCheckOut > defaultCheckOut) {
      overtimeDurationInHours += moment(actualCheckOut).diff(
        defaultCheckOut,
        "hours",
        true
      );
    }
  }
  lateDurationInHours = parseFloat(lateDurationInHours.toFixed(2));
  overtimeDurationInHours = parseFloat(overtimeDurationInHours.toFixed(2));

  const updatedAttendance = await attendanceModel.findByIdAndUpdate(
    id,
    {
      checkInTime,
      checkOutTime,
      status,
      lateDurationInHours,
      overtimeDurationInHours,
    },
    { new: true, runValidators: true }
  );
  res.status(200).json({
    status: "success",
    data: {
      updatedAttendance,
    },
  });
});
