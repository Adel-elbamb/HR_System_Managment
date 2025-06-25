import employeeModel from "../../DB/models/Employee.model.js";
import payrollModel from "../../DB/models/Payroll.model.js";

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
    return;
  }

  if (doc.status === "present") {
    empPayroll.attendedDays += 1;
  } else {
    empPayroll.absentDays += 1;
  }

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
  console.log("Updated Payroll Successfully after Update Attendance");
};

export default UpdatePayrollOnSaveAttendance;
