import mongoose from "mongoose";
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
      unique: true,
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
        values: ["Male", "Female"],
        message: "{VALUE} is not a valid gender",
      },
    },
    nationality: { type: String },
    birthdate: { type: Date },
    nationalId: {
      type: String,
      unique: true,
      sparse: true,
      minlength: [10, "National ID must be at least 10 characters"],
    },
    weekendDays: {
      type: [String],
      default: ["Friday", "Saturday"],
      validate: {
        validator: function (v) {
          const validDays = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
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
  },
  { timestamps: true }
);

EmployeeSchema.pre("save", function (next) {
  this.hireDate = new Date();
  this.workingHoursPerDay = this;
  next();
});

const employeeModel =
  mongoose.models.Employee || model("Employee", EmployeeSchema);
export default employeeModel;
