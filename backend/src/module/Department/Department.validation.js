const joi = require('joi');
exports.departmentValidation = joi.object({
    departmentName: joi.string().required().min(2)
})