import employeeModel from "../../DB/models/Employee.model.js";
import payrollModel from "../../DB/models/Payroll.model.js";

const UpdatePayrollOnUpdateAttendance = async (oldDoc, updates) => {
  // Fix: use oldDoc instead of doc
  const employee = await employeeModel.findById(oldDoc.employeeId);
  if (!employee) {
    console.log("failed to find the employee to update payroll");
    return;
  }
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const empPayroll = await payrollModel.findOne({
    employeeId: employee._id,
    month: currentMonth,
    year: currentYear,
  });

  if (!empPayroll) {
    return;
  }

  // Fix: use oldDoc for status
  if (
    empPayroll.status &&
    oldDoc.status &&
    empPayroll.status.toString().trim().toLowerCase() !==
      oldDoc.status.toString().trim().toLowerCase()
  ) {
    if (oldDoc.status === "present") {
      empPayroll.attendedDays += 1;
      empPayroll.absentDays -= 1;
    } else {
      empPayroll.attendedDays -= 1;
      empPayroll.absentDays += 1;
    }
  }

  // Calculate differences
  const overtimeDiff =
    (updates.overtimeDurationInHours || 0) -
    (oldDoc.overtimeDurationInHours || 0);
  const lateDiff =
    (updates.lateDurationInHours || 0) - (oldDoc.lateDurationInHours || 0);

  // Update totalOvertime and totalBonusAmount
  if (overtimeDiff !== 0) {
    empPayroll.totalOvertime += overtimeDiff;
    empPayroll.totalBonusAmount += overtimeDiff * employee.overtimeValue;
    empPayroll.netSalary += overtimeDiff * employee.overtimeValue;
  }

  // Update totalDeduction and totalDeductionAmount
  if (lateDiff !== 0) {
    empPayroll.totalDeduction += lateDiff;
    empPayroll.totalDeductionAmount += lateDiff * employee.deductionValue;
    empPayroll.netSalary -= lateDiff * employee.deductionValue;
  }

  // After updating attendedDays, absentDays, totalOvertime, totalDeduction, totalBonusAmount, and totalDeductionAmount, calculate absent deduction and update netSalary
  // Calculate absent deduction using salaryPerHour
  const absentDeduction =
    empPayroll.absentDays *
    employee.workingHoursPerDay *
    employee.salaryPerHour;
  // Late deduction uses deductionValue
  const lateDeduction = empPayroll.totalDeduction * employee.deductionValue;
  empPayroll.totalDeductionAmount = lateDeduction + absentDeduction;
  empPayroll.netSalary =
    employee.salary +
    empPayroll.totalBonusAmount -
    empPayroll.totalDeductionAmount;
  await empPayroll.save();
  console.log("Updated Payroll Successfully after Update Attendance");
};

export default UpdatePayrollOnUpdateAttendance;
