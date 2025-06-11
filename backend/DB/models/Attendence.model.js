import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AttendanceSchema = new Schema(
  {
    employeeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Employee", 
      required: [true, "Employee ID is required"]
    },
    date: { 
      type: Date, 
      required: [true, "Date is required"],
      validate: {
        validator: function(v) {
          return v instanceof Date && !isNaN(v);
        },
        message: "Please enter a valid date"
      }
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
      min: [0, "Late duration cannot be negative"]
    },
    overtimeDurationInHours: { 
      type: Number, 
      default: 0,
      min: [0, "Overtime duration cannot be negative"]
    },
    status: {
      type: String,
      enum: {
        values: ["Present", "Absent", "On Leave"],
        message: "{VALUE} is not a valid status"
      },
      default: "Present",
    },
  },
  { timestamps: true }
);

AttendanceSchema.pre(/^find/, function(next) {
  this.populate({
    path: "employeeId",
    select: "firstName lastName",
  });
  next();
})

const attendanceModel = mongoose.models.Attendance || model("Attendance", AttendanceSchema);
export default attendanceModel;
