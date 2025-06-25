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

  let lateDurationInHours = attendance.lateDurationInHours;
  let overtimeDurationInHours = attendance.overtimeDurationInHours;
  lateDurationInHours = parseFloat(lateDurationInHours.toFixed(2));
  overtimeDurationInHours = parseFloat(overtimeDurationInHours.toFixed(2));

  if (checkInTime && status === "Present") {
    const defaultCheckIn = parseTimeToDate(
      employee.defaultCheckInTime || "09:00:00",
      attendance.date
    );
    const actualCheckIn = parseTimeToDate(checkInTime, attendance.date);
    lateDurationInHours =
      actualCheckIn > defaultCheckIn
        ? moment(actualCheckIn).diff(defaultCheckIn, "hours", true)
        : 0;
  }
  if (checkOutTime && status === "Present") {
    const defaultCheckOut = parseTimeToDate(
      employee.defaultCheckOutTime || "17:00:00",
      attendance.date
    );
    const actualCheckOut = parseTimeToDate(checkOutTime, attendance.date);
    overtimeDurationInHours =
      actualCheckOut > defaultCheckOut
        ? moment(actualCheckOut).diff(defaultCheckOut, "hours", true)
        : 0;
  }

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
