import Router from "express";
const router = Router();
import { addEmployee } from "./Controller/AddEmployee.controller.js";

router.route("/").post(addEmployee);

export default router;
