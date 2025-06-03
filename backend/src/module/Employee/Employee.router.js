import Router from "express";
const router = Router();
import validation from "../../middleware/validation.js";
import { addEmployee } from "./Controller/AddEmployee.controller.js";
import { updateEmployee } from "./Controller/UpdateEmployee.controller.js";
import {getAllEmployee} from "./Controller/GetAllEmployee.controller.js"
import {getOneEmployee} from "./Controller/GetOneEmployee.controller.js"
import {
  addEmployeeSchema,
  updateEmployeeSchema,
  deleteIdSchema,
} from "./Employee.validation.js";

router.route("/").post(validation(addEmployeeSchema), addEmployee).get(getAllEmployee)
router.route("/:id").put(validation(updateEmployeeSchema), updateEmployee).get(getOneEmployee)

export default router;
