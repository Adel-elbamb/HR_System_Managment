import { Router } from "express";
import { createHoliday ,updateHoliday , deleteHoliday , allHoliday } from "./controller/holiday.controller.js";
import { createHolidaySchema , updateHolidaySchema , deleteHolidaySchema } from "./holiday.validation.js";
import validation from '../../middleware/validation.js'
const router = Router();

router.post("/",validation(createHolidaySchema),createHoliday);
router.put('/:id',validation(updateHolidaySchema),updateHoliday)
router.delete('/:id',validation(deleteHolidaySchema), deleteHoliday)
router.get('/' , allHoliday)
export default router;
