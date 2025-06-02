import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PayrollSchema = new Schema(
  {
    employee: { 
      type: Schema.Types.ObjectId, 
      ref: "Employee", 
      required: [true, "Employee reference is required"]
    },
    month: { 
      type: String, 
      required: [true, "Month is required"],
    },
    monthDays: { 
      type: Number,
      min: [1, "Month days must be at least 1"],
      max: [31, "Month days cannot exceed 31"]
    },
    attendedDays: { 
      type: Number, 
      default: 0,
      min: [0, "Attended days cannot be negative"],
    },
    absentDays: { 
      type: Number, 
      default: 0,
      min: [0, "Absent days cannot be negative"],
   
    },
    totalOvertime: { 
      type: Number, 
      default: 0,
      min: [0, "Total overtime cannot be negative"]
    },
    totalBonusAmount: { 
      type: Number, 
      default: 0,
      min: [0, "Total bonus amount cannot be negative"]
    },
    totalDeduction: { 
      type: Number, 
      default: 0,
      min: [0, "Total deduction cannot be negative"]
    },
    totalDeductionAmount: { 
      type: Number, 
      default: 0,
      min: [0, "Total deduction amount cannot be negative"]
    },
    netSalary: { 
      type: Number,
      required: [true, "Net salary is required"],
      min: [0, "Net salary cannot be negative"]
    },
    // generatedBy: { type: Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

const payrollModel = mongoose.models.Payroll || model("Payroll", PayrollSchema);
export default payrollModel;
