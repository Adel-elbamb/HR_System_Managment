import attendanceModel from "../../../../DB/models/Attendence.model.js";
import employeeModel from "../../../../DB/models/Employee.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import moment from "moment";


export const getAllAttendance = asyncHandler(async (req, res) => {
  const {
    firstName,
    date,
    startDate,
    endDate,
    sortBy = "createdAt",
    sort = "desc",
    limit = 10,
    page = 1,
  } = req.query;

  const filter = {};

  if (firstName) {
    const employees = await employeeModel
      .find({
        firstName: new RegExp(firstName, "i"),
      })
      .select("_id");

    const employeeIds = employees.map((employee) => employee._id);
    filter.employeeId = { $in: employeeIds };
  }

  if (startDate && endDate) {
    const start = moment(startDate, "YYYY-MM-DD").startOf("day").toDate();
    const end = moment(endDate, "YYYY-MM-DD").endOf("day").toDate();
    filter.date = { $gte: start, $lte: end };
  } else if (date) {
    const start = moment(date, "YYYY-MM-DD").startOf("day").toDate();
    const end = moment(date, "YYYY-MM-DD").endOf("day").toDate();
    filter.date = { $gte: start, $lte: end };
  }

  const allAttendance = await attendanceModel
    .find(filter)
    .sort({ [sortBy]: sort })
    .limit(+limit)
    .skip(+limit * (+page - 1));

  res.status(200).json({
    status: "success",
    data: allAttendance,
  });
});
