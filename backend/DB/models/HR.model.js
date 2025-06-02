import mongoose from "mongoose";
const { Schema, model } = mongoose;

const HRSchema = new Schema(
  {
    email: { 
      type: String, 
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    passwordHash: { 
      type: String, 
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"]
    },
    name: { 
      type: String, 
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"]
    },
  },
  { timestamps: true }
);

const hrModel = mongoose.models.HR || model("HR", HRSchema);
export default hrModel;
