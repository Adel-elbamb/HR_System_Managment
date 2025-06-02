import Router from "express";
const router = Router();
import validation from "../../middleware/validation.js"
import { addEmployee } from "./Controller/AddEmployee.controller.js";
import {
  addEmployeeSchema,
  updateEmployeeSchema,
  deleteIdSchema,
} from "./Employee.validation.js";

router.route("/").post(validation(addEmployeeSchema), addEmployee)


export default router;
