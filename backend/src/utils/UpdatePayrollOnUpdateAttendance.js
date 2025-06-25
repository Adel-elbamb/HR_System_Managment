import employeeModel from "../../DB/models/Employee.model.js";
import payrollModel from "../../DB/models/Payroll.model.js";

const UpdatePayrollOnUpdateAttendance = async (oldDoc, updates) => {
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

  if (
    empPayroll.status &&
    doc.status &&
    empPayroll.status.toString().trim().toLowerCase() !==
      doc.status.toString().trim().toLowerCase()
  ) {
    if (doc.status === "present") {
      empPayroll.attendedDays += 1;
      empPayroll.absentDays -= 1;
    } else {
      empPayroll.attendedDays -= 1;
      empPayroll.absentDays += 1;
    }
  }

  if (oldDoc.checkInTime !== updates.checkInTime) {
    if (oldDoc.overtimeDurationInHours > updates.overtimeDurationInHours) {
    } else if (
      oldDoc.overtimeDurationInHours < updates.overtimeDurationInHours
    ) {
    }
  }
  //   if (doc.overtimeDurationInHours > 0) {
  //     empPayroll.totalOvertime += doc.overtimeDurationInHours;

  //     empPayroll.totalBonusAmount +=
  //       doc.overtimeDurationInHours * employee.overtimeValue;

  //     empPayroll.netSalary +=
  //       doc.overtimeDurationInHours * employee.overtimeValue;
  //   }

  //   if (doc.lateDurationInHours > 0) {
  //     empPayroll.totalDeduction += doc.lateDurationInHours;

  //     empPayroll.totalDeductionAmount +=
  //       doc.lateDurationInHours * employee.deductionValue;

  //     empPayroll.netSalary -= doc.lateDurationInHours * employee.deductionValue;
  //   }

  await empPayroll.save();
  console.log("Updated Payroll Successfully after Update Attendance");
};

export default UpdatePayrollOnUpdateAttendance;
