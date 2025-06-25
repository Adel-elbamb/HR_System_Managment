import express from "express";
const router = express.Router();
import { getAllPayroll } from "./controller/GetAllPayRolls.controller.js";
import { getPayRollById } from "./controller/GetPayRollById.controller.js";

router.route("/").get(getAllPayroll);

router.route("/:id").get(getPayRollById);

export default router;
