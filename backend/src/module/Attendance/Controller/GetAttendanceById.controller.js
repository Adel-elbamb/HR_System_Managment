import attendanceModel from '../../../../DB/models/Attendence.model.js';
import AppError from '../../../utils/AppError.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';


export const getAttendanceById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const attendance = await attendanceModel.findById(id);
    if (!attendance) {
        return next(new AppError('Attendance not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: attendance,
    });
});