import { Router } from "express";
import {
  createHolidaySchema,
  updateHolidaySchema,
  deleteHolidaySchema,
} from "./holiday.validation.js";
import validation from "../../middleware/validation.js";
import { createHoliday } from "./controller/AddHoliday.controller.js";
import { updateHoliday } from "./controller/UpdateHoliday.controller.js";
import { deleteHoliday } from "./controller/DeleteHoliday.controller.js";
import { allHoliday } from "./controller/GatAllHolidays.controller.js";
const router = Router();

router.post("/", validation(createHolidaySchema), createHoliday);
router.put("/:id", validation(updateHolidaySchema), updateHoliday);
router.delete("/:id", validation(deleteHolidaySchema), deleteHoliday);
router.get("/", allHoliday);
export default router;
