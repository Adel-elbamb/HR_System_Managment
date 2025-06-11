import attendanceModel from '../../../../DB/models/Attendence.model.js';
import employeeModel from '../../../../DB/models/Employee.model.js'
import { asyncHandler } from '../../../utils/asyncHandler.js';
export const getAllAttendance = asyncHandler(async (req, res) => {
    try {
        const allAttendance = await attendanceModel.find({});
        res.status(200).json(allAttendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
