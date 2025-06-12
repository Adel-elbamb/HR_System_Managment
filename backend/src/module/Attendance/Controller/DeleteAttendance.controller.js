import attendanceModel from '../../../../DB/models/Attendence.model.js';
import {asyncHandler}  from '../../../utils/asyncHandler.js';
import AppError from '../../../utils/AppError.js'


export const deleteAttendance = asyncHandler(async (req, res, next) => {
    const {id} = req.params;
    const attendance = await attendanceModel.findByIdAndDelete(id);
    if(!attendance) return next(new AppError('No such attendance found', 404));
    res.status(200).json({
        status: 'Deleted successfully',
        data: {
            attendance
        }
    })
});