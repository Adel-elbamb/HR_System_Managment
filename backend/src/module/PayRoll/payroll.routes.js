import express from 'express';
const router = express.Router();
import {addPayRoll} from './controller/AddPayRoll.controller.js';
import {getAllPayroll} from './controller/GetAllPayRolls.controller.js';
import {getPayRollById} from './controller/GetPayRollById.controller.js';
import {updatePayRoll} from './controller/UpdatePayRoll.controller.js';
import {deletePayroll} from './controller/DeletePayRoll.controller.js';

import validation from '../../middleware/validation.js';

import {addPayrollSchema,updatePayrollSchema} from  './payroll.validation.js'

router.route('/')
      .post(validation(addPayrollSchema),addPayRoll)
      .get(getAllPayroll)

router.route('/:id')
       .get(getPayRollById)
       .put(validation(updatePayrollSchema),updatePayRoll)
       .delete(deletePayroll)
                


export  default router;