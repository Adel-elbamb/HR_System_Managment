import express from 'express';
import {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} from './Controller/department.controller.js';

const router = express.Router();

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

export default router;
