const joi = require('joi');

exports.departmentValidation = joi.object({
    departmentName: joi.string()
        .required()
        .min(2)
        .max(50)
        .trim()
        .pattern(/^[a-zA-Z0-9\s-]+$/)
        .messages({
            'string.pattern.base': 'Department name can only contain letters, numbers, spaces, and hyphens',
            'string.min': 'Department name must be at least 2 characters long',
            'string.max': 'Department name cannot exceed 50 characters',
            'any.required': 'Department name is required'
        })
});

exports.updateDepartmentValidation = joi.object({
    departmentName: joi.string()
        .min(2)
        .max(50)
        .trim()
        .pattern(/^[a-zA-Z0-9\s-]+$/)
        .messages({
            'string.pattern.base': 'Department name can only contain letters, numbers, spaces, and hyphens',
            'string.min': 'Department name must be at least 2 characters long',
            'string.max': 'Department name cannot exceed 50 characters'
        })
});

exports.queryValidation = joi.object({
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
    sortBy: joi.string().valid('departmentName', 'createdAt').default('createdAt'),
    sortOrder: joi.string().valid('asc', 'desc').default('desc'),
    search: joi.string().trim().min(1).max(50)
});