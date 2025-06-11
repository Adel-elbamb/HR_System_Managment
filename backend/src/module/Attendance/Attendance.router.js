import  Router  from "express";

const router = Router();
import {addAttendance} from './Controller/AddAttendance.controller.js'
import {getAllAttendance} from './Controller/GetAllAttendance.controller.js'
import {getAttendanceById} from './Controller/GetAttendanceById.controller.js'
router.route('/')
      .get(getAllAttendance)
      .post(addAttendance);

router.route('/:id').get(getAttendanceById)
    //   .put(updateAttendance)
    //   .delete(deleteAttendance);





export default router;