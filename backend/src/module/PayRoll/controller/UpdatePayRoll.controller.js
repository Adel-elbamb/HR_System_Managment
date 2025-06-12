import payrollModel from '../../../../DB/models/Payroll.model.js';
import AppError from "../../../utils/AppError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import employeeModel from '../../../../DB/models/Employee.model.js'


export const updatePayRoll = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const {
    month,
    monthDays,
    attendedDays,
    absentDays,
    totalOvertime,
    totalBonusAmount,
    totalDeduction,
    totalDeductionAmount,
    netSalary
  } = req.body;

  const payroll = await payrollModel.findById(id);
  if (!payroll) {
    return next(new AppError('Payroll not found', 404));
  }

  const employee = await employeeModel.findById(payroll.employeeId).select('+salary');
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const baseSalary = employee.salary;
  if (!baseSalary) {
    return next(new AppError('Employee base salary is missing', 400));
  }

  if (month !== undefined) payroll.month = month;
  if (monthDays !== undefined) payroll.monthDays = monthDays;
  if (attendedDays !== undefined) payroll.attendedDays = attendedDays;
  if (absentDays !== undefined) payroll.absentDays = absentDays;
  if (totalOvertime !== undefined) payroll.totalOvertime = totalOvertime;
  if (totalBonusAmount !== undefined) payroll.totalBonusAmount = totalBonusAmount;
  if (totalDeduction !== undefined) payroll.totalDeduction = totalDeduction;
  if (totalDeductionAmount !== undefined) payroll.totalDeductionAmount = totalDeductionAmount;

  if (netSalary !== undefined) {
    payroll.netSalary = netSalary;
  } else {
    const daysInMonth = payroll.monthDays || 30;
    const attended = payroll.attendedDays || 0;
    const overtimeHours = payroll.totalOvertime || 0;
    const bonus = payroll.totalBonusAmount || 0;
    const deductionAmount = payroll.totalDeductionAmount || 0;
    const deduction = payroll.totalDeduction || 0;


    const salaryPerDay = baseSalary / daysInMonth;
    const hourlyRate = salaryPerDay / 8;
    const attendanceSalary = salaryPerDay * attended;
    const overtimePay = overtimeHours * hourlyRate;

    payroll.netSalary = Math.max(0, attendanceSalary + overtimePay + bonus - deduction);
  }

  await payroll.save();

  res.status(200).json({
    status: 'success',
    data: {
      payroll,
    },
  });
});
