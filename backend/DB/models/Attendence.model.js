import mongoose from "mongoose";
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

const attendanceModel =
  mongoose.models.Attendance || model("Attendance", AttendanceSchema);
export default attendanceModel;
