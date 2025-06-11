import  Router  from "express";

const router = Router();
import {addAttendance} from './Controller/AddAttendance.controller.js'
import {getAllAttendance} from './Controller/GetAllAttendance.controller.js'
router.route('/')
      .get(getAllAttendance)
      .post(addAttendance);






export default router;