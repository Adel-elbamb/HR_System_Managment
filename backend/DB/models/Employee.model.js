import mongoose from "mongoose";
import payrollModel from "./Payroll.model.js";
import countWorkingDays from "../../src/utils/workingDaysOfMonthCount.js";
import getCurrentMonthDaysCount from "../../src/utils/CurrentMonthDaysCount.js";
const { Schema, model } = mongoose;

const EmployeeSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    phone: {
      type: String,
      // match: [/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, "Please enter a valid phone number"]
    },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    hireDate: { type: Date },
    salary: {
      type: Number,
      min: [0, "Salary cannot be negative"],
    },
    workingHoursPerDay: {
      type: Number,
      default: 8,
      min: [1, "Working hours must be at least 1"],
      max: [24, "Working hours cannot exceed 24"],
    },
    defaultCheckInTime: { type: String, default: "09:00:00" },
    defaultCheckOutTime: { type: String, default: "15:00:00" },
    address: { type: String },
    gender: {
      type: String,
      enum: {
        values: ["male", "female"],
        message: "{VALUE} is not a valid gender",
      },
    },
    nationality: { type: String },
    birthdate: { type: String },
    nationalId: {
      type: String,
      minlength: [14, "National ID must be 14 characters"],
    },
    weekendDays: {
      type: [String],
      default: ["Friday", "Saturday"],
      validate: {
        validator: function (v) {
          const validDays = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ];
          return v.every((day) => validDays.includes(day));
        },
        message: "Invalid weekend day specified",
      },
    },
    overtimeValue: {
      type: Number,
      default: 0,
      min: [0, "Overtime value cannot be negative"],
    },
    deductionValue: {
      type: Number,
      default: 0,
      min: [0, "Deduction value cannot be negative"],
    },
    salaryPerHour: {
      type: Number,
      min: [0, "Salary per hour cannot be negative"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

EmployeeSchema.pre("save", function (next) {
  this.hireDate = new Date();
  this.workingHoursPerDay = this.defaultCheckOutTime - this.defaultCheckInTime;
  next();
});

EmployeeSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  const data = update?.$set || update;

  const checkIn = data.defaultCheckInTime;
  const checkOut = data.defaultCheckOutTime;

  const shouldCalculateWorkingHours =
    typeof checkIn === "string" && typeof checkOut === "string";

  if (shouldCalculateWorkingHours) {
    const [startHour, startMin] = checkIn.split(":").map(Number);
    const [endHour, endMin] = checkOut.split(":").map(Number);

    const totalHours = endHour + endMin / 60 - (startHour + startMin / 60);
    const workingHours = Number(totalHours.toFixed(2));

    if (update.$set) {
      update.$set.workingHoursPerDay = workingHours;
    } else {
      update.workingHoursPerDay = workingHours;
    }
  } else {
    if (update?.$set?.workingHoursPerDay !== undefined) {
      delete update.$set.workingHoursPerDay;
    }
    if (update?.workingHoursPerDay !== undefined) {
      delete update.workingHoursPerDay;
    }
  }

  next();
});

EmployeeSchema.pre(/^find/, function (next) {
  this.populate({
    path: "department",
    select: "departmentName",
  });

  next();
});

EmployeeSchema.post("save", function (next) {
  const monthDays = getCurrentMonthDaysCount(this.hireDate);
  const absentDays = this.hireDate.getDate() - 1;
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const currentYear = new Date().getFullYear();
  const payroll = new payrollModel({
    employeeId: this._id,
    month: currentMonth,
    year: currentYear,
    monthDays,
    attendedDays: 0,
    absentDays,
    totalOvertime: 0,
    totalBonusAmount: 0,
    totalDeduction: 0,
    totalDeductionAmount: 0,
    netSalary: 0,
  });
  payroll.save();
});

EmployeeSchema.index({ email: 1 }, { unique: true });
EmployeeSchema.index({ address: 1 }, { unique: true });
EmployeeSchema.index({ phone: 1 }, { unique: true });
EmployeeSchema.index({ nationalId: 1 }, { unique: true });

const employeeModel =
  mongoose.models.Employee || model("Employee", EmployeeSchema);
export default employeeModel;
