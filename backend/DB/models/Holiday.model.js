import mongoose from "mongoose";
const { Schema, model } = mongoose;

const OfficialHolidaySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Holiday name is required"],
      trim: true,
      minlength: [2, "Holiday name must be at least 2 characters"],
    },
    date: {
      type: Date,
      required: [true, "Holiday date is required"],
    },
  },
  { timestamps: true }
);

OfficialHolidaySchema.set("toJSON", {
  transform: function (doc, ret) {
    if (ret.date instanceof Date) {
      const day = String(ret.date.getDate()).padStart(2, "0");
      const month = String(ret.date.getMonth() + 1).padStart(2, "0");
      const year = ret.date.getFullYear();
      ret.date = `${day}/${month}/${year}`;
    }
    return ret;
  },
});

const holidayModel =
  mongoose.models.OfficialHoliday ||
  model("OfficialHoliday", OfficialHolidaySchema);
export default holidayModel;
