import mongoose from 'mongoose';
import Department from '../../../../DB/models/Department.model.js';
import AppError from '../../../utils/AppError.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { departmentValidation} from '../Department.validation.js';
import { checkDuplicateDepartment } from './CheckDuplicateDepartment.js';


export const createDepartment = asyncHandler(async (req, res, next) => {
    const { error } = departmentValidation.validate(req.body);
    if (error) {
        return next(new AppError(error.details[0].message, 400));
    }

    const { departmentName } = req.body;

    const duplicate = await checkDuplicateDepartment(departmentName);
    if (duplicate) {
        return next(new AppError('Department with this name already exists', 409));
    }

    const department = await Department.create({ departmentName });
    
    return res.status(201).json({
        success: true,
        message: 'Department Created Successfully',
        data: department,
        timestamp: new Date().toISOString()
    });
});