import payrollModel from '../../../../DB/models/Payroll.model.js';
import AppError from "../../../utils/AppError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import employeeModel from '../../../../DB/models/Employee.model.js'
import moment from 'moment';



export const getAllPayroll = asyncHandler(async (req, res, next) => {
  const { firstName, date, sortBy = 'createdAt', sort = 'desc', limit = 10, page = 1 } = req.query;
  const filter = {};


  if (firstName) {
    const employees = await employeeModel.find({
      firstName: new RegExp(firstName, 'i')
    }).select('_id');

    const employeeIds = employees.map((e) => e._id);
    filter.employeeId = { $in: employeeIds };
  }

  if (date) {
    const start = moment.utc(date, 'YYYY-MM').startOf('month').toDate();
    const end = moment.utc(date, 'YYYY-MM').endOf('month').toDate();
    filter.month = { $gte: start, $lte: end };
  }


  const payroll = await payrollModel
    .find(filter)
    .sort({ [sortBy]: sort === 'asc' ? 1 : -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  res.status(200).json({
    status: 'success',
    data: {
      payroll
    }
  });
});
