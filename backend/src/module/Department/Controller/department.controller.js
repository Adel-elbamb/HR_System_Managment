import mongoose from 'mongoose';
import Department from '../../../../DB/models/Department.model.js';
import AppError from '../../../utils/AppError.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { departmentValidation, updateDepartmentValidation, queryValidation } from '../Department.validation.js';

const checkDuplicateDepartment = async (departmentName, excludeId = null) => {
    const query = { departmentName: { $regex: new RegExp(`^${departmentName}$`, 'i') } };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    const existingDepartment = await Department.findOne(query);
    return existingDepartment;
};

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

export const getAllDepartments = asyncHandler(async (req, res, next) => {
    const { error, value } = queryValidation.validate(req.query);
    if (error) {
        return next(new AppError(error.details[0].message, 400));
    }

    const { page, limit, sortBy, sortOrder, search } = value;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
        query.departmentName = { $regex: search, $options: 'i' };
    }

    const [departments, total] = await Promise.all([
        Department.find(query)
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit),
        Department.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
        success: true,
        message: 'Departments Fetched Successfully',
        data: departments,
        pagination: {
            page,
            limit,
            total,
            totalPages
        },
        timestamp: new Date().toISOString()
    });
});

export const getDepartmentById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('Invalid department ID format', 400));
    }

    const department = await Department.findById(id);
    if (!department) {
        return next(new AppError('Department Not Found', 404));
    }

    return res.status(200).json({
        success: true,
        message: 'Department Fetched Successfully',
        data: department,
        timestamp: new Date().toISOString()
    });
});

export const updateDepartment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('Invalid department ID format', 400));
    }

    const { error } = updateDepartmentValidation.validate(req.body);
    if (error) {
        return next(new AppError(error.details[0].message, 400));
    }

    const department = await Department.findById(id);
    if (!department) {
        return next(new AppError('Department Not Found', 404));
    }

    const { departmentName } = req.body;

    if (departmentName && departmentName !== department.departmentName) {
        const duplicate = await checkDuplicateDepartment(departmentName, id);
        if (duplicate) {
            return next(new AppError('Department with this name already exists', 409));
        }
        department.departmentName = departmentName;
    }

    await department.save();

    return res.status(200).json({
        success: true,
        message: 'Department Updated Successfully',
        data: department,
        timestamp: new Date().toISOString()
    });
});

export const deleteDepartment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('Invalid department ID format', 400));
    }

    const department = await Department.findByIdAndDelete(id);
    if (!department) {
        return next(new AppError('Department Not Found', 404));
    }

    return res.status(200).json({
        success: true,
        message: 'Department Deleted Successfully',
        timestamp: new Date().toISOString()
    });
});
