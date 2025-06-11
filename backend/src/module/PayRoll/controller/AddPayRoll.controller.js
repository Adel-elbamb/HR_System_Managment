import payrollModel from '../../../../DB/models/Payroll.model.js';
import employeeModel from "../../../../DB/models/Employee.model.js";
import attendanceModel from '../../../../DB/models/Attendence.model.js';
import holidayModel  from "../../../../DB/models/Holiday.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import moment from "moment";
import AppError from "../../../utils/AppError.js";

export const addPayRoll = asyncHandler(async (req, res, next) => {

    const { employeeId, month, monthDays, totalBonusAmount = 0 } = req.body;

    if (!employeeId || !month || !monthDays) {
    return next(new AppError("You should enter monthDays, month and employeeId ", 400));
    }

    const employeeData = await employeeModel.findById(employeeId);
    if (!employeeData) {
    return next(new AppError('Employee not found', 404));
    }

    const startOfMonth = moment(month).startOf('month').toDate();
    const endOfMonth = moment(month).endOf('month').toDate();

    const attendances = await attendanceModel.find({
    employeeId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const holidays = await holidayModel.find({
    date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const holidayDates = holidays.map(h => moment(h.date).format('YYYY-MM-DD'));

    let attendedDays = 0;
    let absentDays = 0;
    let totalOvertime = 0;
    let totalLateHours = 0;

    const allDays = [];
    let day = moment(startOfMonth);
    const end = moment(endOfMonth);

    while (day.isSameOrBefore(end)) {
    allDays.push(day.format('YYYY-MM-DD'));
    day.add(1, 'days');
    }

    for (let day of allDays) {
    const attendance = attendances.find(a => moment(a.date).format('YYYY-MM-DD') === day);
    const dayOfWeek = moment(day).format('dddd');

    if (holidayDates.includes(day) || employeeData.weekendDays.includes(dayOfWeek)) {
        continue;
    }

    if (attendance) {
        if (attendance.status === 'Present') {
        attendedDays++;
        totalOvertime += attendance.overtimeDurationInHours;
        totalLateHours += attendance.lateDurationInHours;
        } else if (attendance.status === 'Absent') {
        absentDays++;
        }
    } else {
        absentDays++;
    }
    }

    const totalDeduction = totalLateHours + (absentDays * employeeData.workingHoursPerDay);
    const totalDeductionAmount = totalDeduction * employeeData.deductionValue;
    const overtimeAmount = totalOvertime * employeeData.overtimeValue;

    const netSalary = employeeData.salary + overtimeAmount - totalDeductionAmount + totalBonusAmount;

    const payRoll = await payrollModel.create({
    employee: employeeId, // required ref
    employeeId, // optional
    month,
    monthDays,
    attendedDays,
    absentDays,
    totalOvertime,
    totalBonusAmount,
    totalDeduction,
    totalDeductionAmount,
    netSalary,
    });

    res.status(200).json({
    status: "success to add pay roll",
    data: { payRoll },
    });
    
})
