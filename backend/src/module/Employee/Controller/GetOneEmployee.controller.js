import { asyncHandler } from "../../../utils/asyncHandler.js";
import  employeeModel from '../../../../DB/models/Employee.model.js';

import mongoose from "mongoose";

export const getOneEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid employee ID format" });
    }

    const employee = await employeeModel.findById(id).lean();

    if (!employee) {
        return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({
        success: true,
        data: employee,
    });
});