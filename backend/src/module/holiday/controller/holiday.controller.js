import { asyncHandler } from "../../../utils/asyncHandler.js";
import  AppError  from "../../../utils/AppError.js";
import holidayModel  from "../../../../DB/models/Holiday.model.js";
import MailMessage from "nodemailer/lib/mailer/mail-message.js";

// create holiday 
export const createHoliday = asyncHandler(async(req,res,next)=>{
    const {date,name} = req.body;
    if(!date || !name ){
        return next(new AppError("All fields are required",400));
    }
    const holiday = await holidayModel.create({date,name});
    res.status(201).json({
        success:true,
        message:"Holiday created successfully",
        holiday
    })
})

// update Holiday 
export const updateHoliday = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { date, name } = req.body;

  const updateHoliday = await holidayModel.findByIdAndUpdate(
    id,
    { name, date },
    { new: true, runValidators: true } // optional but recommended
  );

  if (!updateHoliday) {
    return next(new AppError("Holiday not found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "Holiday updated successfully",
    holiday: updateHoliday
  });
});


// delete Holiday 
export const deleteHoliday = asyncHandler(async (req,res,next) => {
    const {id} = req.params 

    const deleteHoliday = await holidayModel.findOneAndDelete(id)
    if (!deleteHoliday) {
        next(AppError("holiday is not found " , 404))
    }

    return res.status(200).json({
        success:true ,
       Message : "Holiday Deleted Successfully"
    })
})

//show all holidays 
export const allHoliday = asyncHandler(async(req , res, next ) => {

    const holiday = await holidayModel.find() 

    return res.status(200).json({
        success : true ,
        message:"all holidays",
        holiday
    })
})





