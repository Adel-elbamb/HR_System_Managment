import Router from "express";
const router = Router();
import { addEmployee } from "./Controller/AddEmployee.controller.js";

router.post("/create", addEmployee);

export default router;
