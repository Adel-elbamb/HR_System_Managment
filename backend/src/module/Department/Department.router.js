const express = require('express');
const router = express.Router();
const {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} = require('./Controller/department.controller');
//create
router.post('/', createDepartment);
//get all
router.get('/', getAllDepartments);
//get by id
router.get('/:id', getDepartmentById);
//update
router.put('/:id', updateDepartment);
//delete    
router.delete('/:id', deleteDepartment);

module.exports = router;
