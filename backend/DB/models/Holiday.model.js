import mongoose from "mongoose";
const { Schema, model } = mongoose;

const OfficialHolidaySchema = new Schema(
  {
    name: { 
      type: String, 
      required: [true, "Holiday name is required"],
      trim: true,
      minlength: [2, "Holiday name must be at least 2 characters"]
    },
    date: { 
      type: Date, 
      required: [true, "Holiday date is required"],
    }
  },
  { timestamps: true }
);

const holidayModel = mongoose.models.OfficialHoliday || model("OfficialHoliday", OfficialHolidaySchema);
export default holidayModel;
