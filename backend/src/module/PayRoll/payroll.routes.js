import express from 'express';
const router = express.Router();
import {addPayRoll} from './controller/AddPayRoll.controller.js';
import {getAllPayroll} from './controller/GetAllPayRolls.controller.js';
router.route('/')
      .post(addPayRoll)
      .get(getAllPayroll)
                


export  default router;