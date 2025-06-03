import { Router } from "express";
import { createHoliday ,updateHoliday , deleteHoliday , allHoliday } from "./controller/holiday.controller.js";


const router = Router();

router.post("/",createHoliday);
router.put('/:id',updateHoliday)
router.delete('/:id', deleteHoliday)
router.get('/' , allHoliday)
export default router;
