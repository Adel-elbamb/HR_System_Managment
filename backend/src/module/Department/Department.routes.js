import express from "express";
import { createDepartment } from "./Controller/AddDepartment.controller.js";
import { getAllDepartments } from "./Controller/GetAllDepartments.controller.js";
import { getDepartmentById } from "./Controller/GetOneDepartment.controller.js";
import { updateDepartment } from "./Controller/UpdateDepartment.controller.js";
import { deleteDepartment } from "./Controller/DeleteDepartment.controller.js";

const router = express.Router();

//create
router.post("/", createDepartment);
//get all
router.get("/", getAllDepartments);
//get by id
router.get("/:id", getDepartmentById);
//update
router.put("/:id", updateDepartment);
//delete
router.delete("/:id", deleteDepartment);

export default router;
