import employeeModel from "../../DB/models/Employee.model.js";
import payrollModel from "../../DB/models/Payroll.model.js";

const UpdatePayrollOnUpdateAttendance = async (oldDoc, updates) => {
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

  // Adjust attended/absent days if status changed
  if (oldDoc.status !== updates.status) {
    if (oldDoc.status === "present") {
      empPayroll.attendedDays -= 1;
      empPayroll.absentDays += 1;
    } else if (oldDoc.status === "absent" && updates.status === "present") {
      empPayroll.attendedDays += 1;
      empPayroll.absentDays -= 1;
    }
  }

  // Calculate overtime and late hour differences
  const overtimeDiff =
    (updates.overtimeDurationInHours || 0) -
    (oldDoc.overtimeDurationInHours || 0);
  const lateDiff =
    (updates.lateDurationInHours || 0) - (oldDoc.lateDurationInHours || 0);

  // Update totalOvertime and totalBonusAmount
  if (overtimeDiff !== 0) {
    empPayroll.totalOvertime += overtimeDiff;
    empPayroll.totalBonusAmount += overtimeDiff * employee.overtimeValue;
  }

  // Update totalDeduction and totalDeductionAmount
  if (lateDiff !== 0) {
    empPayroll.totalDeduction += lateDiff;
  }

  // Recalculate totalDeductionAmount and netSalary
  const absentDeduction =
    empPayroll.absentDays *
    employee.workingHoursPerDay *
    employee.salaryPerHour;
  const lateDeduction = empPayroll.totalDeduction * employee.deductionValue;
  empPayroll.totalDeductionAmount = lateDeduction + absentDeduction;
  empPayroll.netSalary =
    employee.salary +
    empPayroll.totalBonusAmount -
    empPayroll.totalDeductionAmount;
  // Ensure netSalary is not negative
  empPayroll.netSalary = Math.max(empPayroll.netSalary, 0);

  await empPayroll.save();
  console.log("Updated Payroll Successfully after Update Attendance");
};

export default UpdatePayrollOnUpdateAttendance;
