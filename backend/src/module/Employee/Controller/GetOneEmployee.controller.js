import { asyncHandler } from "../../../utils/asyncHandler.js";
import  employeeModel from '../../../../DB/models/Employee.model.js';


export const getOneEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const employee = await employeeModel.findById(id);
    res.status(200).json(employee);
});