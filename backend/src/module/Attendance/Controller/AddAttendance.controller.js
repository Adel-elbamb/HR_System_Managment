import attendanceModel from '../../../../DB/models/Attendence.model.js';
import {asyncHandler}  from '../../../utils/asyncHandler.js';
import AppError from '../../../utils/AppError.js'
import employeeModel from '../../../../DB/models/Employee.model.js'
import holidayModel from '../../../../DB/models/Holiday.model.js'
import moment from 'moment';
// convert time to date and time formate object
const parseTimeToDate= (timeString, dateString) => {
      return moment(`${dateString} ${timeString}`, 'YYYY-MM-DD HH:mm:ss').toDate();
}
export const addAttendance=asyncHandler(async(req,res,next)=>{
    const {employeeId, date, checkInTime, checkOutTime, status}=req.body;

    if(!employeeId || !date || !checkInTime || !checkOutTime || !status)
    {
        next(new AppError("Please fill all the fields"));
    }
    // get employee
    const employee = await employeeModel.findById(employeeId);
    if(!employee)
    {
        next(new AppError("Employee not found"));
    }
    // check if holiday or not
    const holiday = await holidayModel.findOne({date});
    if(holiday)
    {
     next(new AppError("This date is a holiday"));
    }

    //check all days in week
    const weekdays = moment(date).format('dddd');
    if(employee.weekendDays.includes(weekdays))
    {
        next(new AppError("This date is not a weekday"));
    }
    
    let lateDurationInHours = 0;
    let overtimeDurationInHours = 0;
    // calc the late hor
    if(status==='Present' && checkInTime )
    {
       const defaultCheckIn = parseTimeToDate(employee.defaultCheckInTime, date);
      const actualCheckIn = parseTimeToDate(checkInTime, date);
      if (actualCheckIn > defaultCheckIn) {
        lateDurationInHours = moment(actualCheckIn).diff(defaultCheckIn, 'hours', true);
      }
    }
    // calc the overtime hours
  if (status === 'Present' && checkOutTime) {
      const defaultCheckOut = parseTimeToDate(employee.defaultCheckOutTime, date);
      const actualCheckOut = parseTimeToDate(checkOutTime, date);
      if (actualCheckOut > defaultCheckOut) {
        overtimeDurationInHours = moment(actualCheckOut).diff(defaultCheckOut, 'hours', true);
      }
    }

    const attendance = await attendanceModel.create({
      employeeId,
      date,
      checkInTime,
      checkOutTime,
      status,
      lateDurationInHours: lateDurationInHours > 0 ? lateDurationInHours : 0,
      overtimeDurationInHours: overtimeDurationInHours > 0 ? overtimeDurationInHours : 0,
    });
    res.status(200).json({message:"Attendance added successfully", attendance});
});



