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
    hireDate: { type: String },
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
      unique: true,
      sparse: true,
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
}
  },
  { timestamps: true }
);

EmployeeSchema.pre("save", function (next) {
  this.hireDate = new Date().toISOString().split("T")[0];
  this.workingHoursPerDay = this.defaultCheckOutTime - this.defaultCheckInTime;
  next();
});

// EmployeeSchema.pre("findOneAndUpdate", function (next) {
//   const update = this.getUpdate();

//   update.workingHoursPerDay =
//     update.defaultCheckOutTime - update.defaultCheckInTime;
  
//   this.setUpdate(update);
//   next();
// });

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

    const totalHours = (endHour + endMin / 60) - (startHour + startMin / 60);
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






const employeeModel =
  mongoose.models.Employee || model("Employee", EmployeeSchema);
export default employeeModel;
