import mongoose from "mongoose";
const { Schema, model } = mongoose;

const DepartmentSchema = new Schema(
  {
    departmentName: { 
      type: String, 
      required: [true, "Department name is required"],
      trim: true,
      minlength: [2, "Department name must be at least 2 characters"],
      unique: true
    },
  },
  { timestamps: true }
);

const departmentModel = mongoose.models.Department || model("Department", DepartmentSchema);
export default departmentModel;
