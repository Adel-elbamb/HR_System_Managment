import cron from "node-cron";
import employeeModel from "../DB/models/Employee.model.js";
import payrollModel from "../DB/models/Payroll.model.js";
import getCurrentMonthDaysCount from "../src/utils/CurrentMonthDaysCount.js";

// This cron job runs on the 1st of every month to generate payroll entries for all employees
cron.schedule(
  "0 0 1 * *",
  async () => {
    console.log("\u{1F4BC} Generating payroll entries for new month...");

    try {
      const employees = await employeeModel.find();

      const currentMonth = new Date().getMonth() + 1; // 1-12
      const currentYear = new Date().getFullYear();

      const payrollEntries = employees.map((emp) => {
        const monthDays = getCurrentMonthDaysCount();
        return {
          employeeId: emp._id,
          month: currentMonth,
          year: currentYear,
          monthDays,
          attendedDays: 0,
          absentDays: 0,
          totalOvertime: 0,
          totalBonusAmount: 0,
          totalDeduction: 0,
          totalDeductionAmount: 0,
          netSalary: emp.salary,
        };
      });

      await payrollModel.insertMany(payrollEntries);

      console.log(`Payroll generated for ${employees.length} employees.`);
    } catch (err) {
      console.error("Error generating payroll:", err);
    }
  },
  {
    timezone: "Africa/Cairo",
  }
);

// Comment: This job is registered immediately on import, just like MarkAbsentees, and does not need to be called as a function.
