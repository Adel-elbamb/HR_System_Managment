const mongoose = require('mongoose');
const Department = require('../../../../DB/models/Department.model');
const AppError = require('../../../utils/AppError');
const asyncHandler = require('../../../utils/asyncHandler');
exports.createDepartment = asyncHandler(async (req , res , next)=>{
    const {departmentName} = req.body;
    if(!departmentName){
        return next(new AppError("Department Name Required",400));
    }
    const department = await Department.create({departmentName});
    return res.status(201).json({
        message : "Department Created Successfully",
        success : true,
        data : department
    })
});
exports.getAllDepartments = asyncHandler(async (req , res , next)=>{
    const departments = await Department.find();
    res.status(200).json({
        message : "All Departments Fetched Successfully",
        success : true,
        data : departments
    })
});
exports.getDepartmentById = asyncHandler(async (req , res , next)=>{
    const {id} = req.params;
    const department = await Department.findById(id);
    if(! department){
        return next(new AppError("Department Not Founded",404));
    }
    return res.status(200).json({
        message : "Department Fetched Successfully",
        success : true,
        data : department
    })
});
exports.updateDepartment = asyncHandler(async (req , res , next)=>{
    const {id} = req.params;
    const department = await Department.findById(id);
    if(! department){
        return next(new AppError("Department Not Founded",404));
    }
    const {departmentName} = req.body;
    if(departmentName) department.departmentName = departmentName;
    await department.save();
    return res.status(200).json({
        message : "Department Updated Successfully",
        success : true,
        data : department
    })
});
exports.deleteDepartment = asyncHandler(async(req , res , next)=>{
    const {id} = req.params;
    const department = await Department.findOneAndDelete({
        _id:id
    });
    if(! department) return(new AppError("Department Not Founded",404));
    return res.status(200).json({
        message : "Department Deleted Successfully",
        success : true,
    })
})
