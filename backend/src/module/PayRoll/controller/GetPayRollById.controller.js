import payrollModel from '../../../../DB/models/Payroll.model.js';
import AppError from "../../../utils/AppError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";


export const getPayRollById = asyncHandler(async (req, res, next) => {

    const { id } = req.params;

    const payRoll = await payrollModel.findById(id);

    if (!payRoll) {
        return next(new AppError('Payroll not found', 404));
    
    }

    res.status(200).json({
        status: 'success',
        data: {
            payRoll
        }
    });
});


