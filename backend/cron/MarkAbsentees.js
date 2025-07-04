import cron from "node-cron";
import employeeModel from "../DB/models/Employee.model.js";
import attendanceModel from "../DB/models/Attendence.model.js";
import holidayModel from "../DB/models/Holiday.model.js";
import moment from "moment";

// This cron job runs every day at 6 PM to mark absentees
cron.schedule("0 18 * * *", async () => {
  const today = moment().startOf("day").toDate();
  const employees = await employeeModel.find();
  const holidays = await holidayModel.find({ date: today });
  const holidayDates = holidays.map((h) => moment(h.date).format("YYYY-MM-DD"));

  for (const emp of employees) {
    // Get today's day name (e.g., 'Monday')
    const dayName = moment(today).format("dddd");
    // Skip if today is a weekend for this employee or a holiday
    if (
      emp.weekendDays.includes(dayName) ||
      holidayDates.includes(moment(today).format("YYYY-MM-DD"))
    ) {
      continue;
    }
    // Check if attendance already exists for today
    const attendance = await attendanceModel.findOne({
      employeeId: emp._id,
      date: today,
    });
    if (!attendance) {
      // If no attendance, mark as absent
      await attendanceModel.create({
        employeeId: emp._id,
        date: today,
        status: "absent",
        checkInTime: null,
        checkOutTime: null,
        lateDurationInHours: 0,
        overtimeDurationInHours: 0,
      });
      // Comment: This will also trigger payroll deduction for absence
    }
  }
  console.log("[MarkAbsentees] Absentees marked for today.");
});

// Comment: This job ensures that every employee who does not check in is automatically marked as absent, and their payroll will reflect the deduction for a full working day (workingHoursPerDay * salaryPerHour).
