import  Router  from "express";

const router = Router();
import {addAttendance} from './Controller/AddAttendance.controller.js'
import {getAllAttendance} from './Controller/GetAllAttendance.controller.js'
import {getAttendanceById} from './Controller/GetAttendanceById.controller.js'
import {updateAttendance} from './Controller/UpdateAttendance.controller.js'
import {deleteAttendance} from './Controller/DeleteAttendance.controller.js'
import validation from '../../middleware/validation.js'
import { addAttendanceSchema } from "./Attendance.validation.js";

router.route('/')
      .get(getAllAttendance)
      .post(validation(addAttendanceSchema),addAttendance);

router.route('/:id').get(getAttendanceById)
      .put(updateAttendance)
      .delete(deleteAttendance)
    





export default router;