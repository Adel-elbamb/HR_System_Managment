import Router from "express";
const router = Router();
import { addEmployee } from "./Controller/AddEmployee.controller.js";
import { updateEmployee } from "./Controller/UpdateEmployee.controller.js";
router.route("/").post(addEmployee)
router.route("/:id").put(updateEmployee);

export default router;
