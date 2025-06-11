import express from 'express';
const router = express.Router();
import {addPayRoll} from './controller/AddPayRoll.controller.js';

router.route('/').post(addPayRoll)


export  default router;