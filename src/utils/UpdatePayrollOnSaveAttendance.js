import employeeModel from "../../DB/models/Employee.model.js";
import payrollModel from "../../DB/models/Payroll.model.js";
import getCurrentMonthDaysCount from "./CurrentMonthDaysCount.js";

const UpdatePayrollOnSaveAttendance = async (doc) => {
  if (!doc) return;
  const employee = await employeeModel.findById(doc.employeeId);
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
    const monthDays = getCurrentMonthDaysCount();
    let attendedDays = 0;
    let absentDays = 0;
    let totalOvertime = 0;
    let totalDeduction = 0;
    let totalBonusAmount = 0;
    let totalDeductionAmount = 0;
    let netSalary = employee.salary;
    if (doc.status === "present") {
      attendedDays += 1;
    } else {
      absentDays += 1;
    }
    if (doc.overtimeDurationInHours > 0) {
      totalOvertime += doc.overtimeDurationInHours;
      totalBonusAmount += doc.overtimeDurationInHours * employee.overtimeValue;
      netSalary += doc.overtimeDurationInHours * employee.overtimeValue;
    }

    if (doc.lateDurationInHours > 0) {
      totalDeduction += doc.lateDurationInHours;
      totalDeductionAmount += doc.lateDurationInHours * employee.deductionValue;
      netSalary -= doc.lateDurationInHours * employee.deductionValue;
    }
    // Ensure netSalary is not negative
    netSalary = Math.max(netSalary, 0);
    const payrollEntries = {
      employeeId: employee._id,
      month: currentMonth,
      year: currentYear,
      monthDays,
      attendedDays,
      absentDays,
      totalOvertime,
      totalBonusAmount,
      totalDeduction,
      totalDeductionAmount,
      netSalary,
    };
    await payrollModel.create(payrollEntries);
    return;
  }

  if (doc.status === "present") {
    empPayroll.attendedDays += 1;
    if (doc.overtimeDurationInHours > 0) {
      empPayroll.totalOvertime += doc.overtimeDurationInHours;
      empPayroll.totalBonusAmount +=
        doc.overtimeDurationInHours * employee.overtimeValue;
      empPayroll.netSalary +=
        doc.overtimeDurationInHours * employee.overtimeValue;
    }

    if (doc.lateDurationInHours > 0) {
      empPayroll.totalDeduction += doc.lateDurationInHours;
      empPayroll.totalDeductionAmount +=
        doc.lateDurationInHours * employee.deductionValue;
      empPayroll.netSalary -= doc.lateDurationInHours * employee.deductionValue;
    }
    await empPayroll.save();
  } else {
    empPayroll.absentDays += 1;
    // After updating attendedDays, absentDays, totalOvertime, totalDeduction, totalBonusAmount, and totalDeductionAmount, calculate absent deduction and update netSalary
    // Calculate absent deduction using salaryPerHour
    const absentDeduction =
      employee.workingHoursPerDay *
      employee.salaryPerHour;
    // Late deduction uses deductionValue
    empPayroll.totalDeductionAmount +=  absentDeduction;
    empPayroll.netSalary -=
      empPayroll.totalDeductionAmount;
    // Ensure netSalary is not negative
    await empPayroll.save();
  }

  console.log("Updated Payroll Successfully after Update Attendance");
};

export default UpdatePayrollOnSaveAttendance;
