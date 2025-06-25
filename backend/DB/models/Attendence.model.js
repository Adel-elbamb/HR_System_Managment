import mongoose from "mongoose";
import payrollModel from "./Payroll.model.js";
import employeeModel from "./Employee.model.js";
const { Schema, model } = mongoose;

const AttendanceSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      validate: {
        validator: function (v) {
          return v instanceof Date && !isNaN(v);
        },
        message: "Please enter a valid date",
      },
    },
    checkInTime: {
      type: String,
    },
    checkOutTime: {
      type: String,
    },
    lateDurationInHours: {
      type: Number,
      default: 0,
      min: [0, "Late duration cannot be negative"],
    },
    overtimeDurationInHours: {
      type: Number,
      default: 0,
      min: [0, "Overtime duration cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: ["present", "absent", "On Leave"],
        message: "{VALUE} is not a valid status",
      },
      default: "present",
    },
  },
  { timestamps: true }
);

AttendanceSchema.pre(/^find/, function (next) {
  this.populate({
    path: "employeeId",
    select: "firstName lastName",
  });

  next();
});

AttendanceSchema.set("toJSON", {
  transform: function (doc, ret) {
    if (ret.date instanceof Date) {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = days[ret.date.getDay()];
      const day = String(ret.date.getDate()).padStart(2, "0");
      const month = String(ret.date.getMonth() + 1).padStart(2, "0");
      const year = ret.date.getFullYear();
      ret.date = `${dayName}: ${day}/${month}/${year}`;
    }
    return ret;
  },
});

AttendanceSchema.post("save", async function (next) {
  const employee = await employeeModel.findById(this.employeeId);
  if (!employee) {
    console.log("failed to find the employee to update payroll");
    return;
  }
  const empPayroll = await payrollModel.find({ employeeId: employee._id });
  if (this.status === "present") {
    empPayroll.attendedDays += 1;
  } else {
    empPayroll.absentDays += 1;
  }
  if (this.overtimeDurationInHours > 0) {
    empPayroll.totalOvertime += overtimeDurationInHours;
    empPayroll.totalBonusAmount +=
      overtimeDurationInHours * employee.overtimeValue;
    empPayroll.netSalary += overtimeDurationInHours * employee.overtimeValue;
  }
  if (this.lateDurationInHours > 0) {
    empPayroll.totalDeduction += lateDurationInHours;
    empPayroll.totalDeductionAmount +=
      lateDurationInHours * employee.deductionValue;
    empPayroll.netSalary -= lateDurationInHours * employee.deductionValue;
  }
  await empPayroll.save();
  console.log("Updated Payroll Successfully after Update Attendance");
});

const attendanceModel =
  mongoose.models.Attendance || model("Attendance", AttendanceSchema);
export default attendanceModel;
