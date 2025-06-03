import Router from "express";
const router = Router();
import validation from "../../middleware/validation.js";
import { addEmployee } from "./Controller/AddEmployee.controller.js";
import { updateEmployee } from "./Controller/UpdateEmployee.controller.js";
import { getAllEmployee } from "./Controller/GetAllEmployee.controller.js";
import { getOneEmployee } from "./Controller/GetOneEmployee.controller.js";
import {
  addEmployeeSchema,
  updateEmployeeSchema,
  deleteIdSchema,
} from "./Employee.validation.js";

import { deleteEmployee } from "./Controller/DeleteEmployee.controller.js";
import { getDeletedEmployees } from "./Controller/GetAllDeletedEmployees.controller.js";
import { restoreEmployee } from "./Controller/RestoreDeletedEmployee.controller.js";

router
  .route("/")
  .post(validation(addEmployeeSchema), addEmployee)
  .get(getAllEmployee);
  router
  .route("/:id")
  .put(validation(updateEmployeeSchema), updateEmployee)
  .get(getOneEmployee)
  .delete(deleteEmployee);
  router.route("/restore/:id").patch(restoreEmployee);
  router.get("/deleted", getDeletedEmployees);

export default router;
