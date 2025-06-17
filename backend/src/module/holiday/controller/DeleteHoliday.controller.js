import { asyncHandler } from "../../../utils/asyncHandler.js";
import  AppError  from "../../../utils/AppError.js";
import holidayModel  from "../../../../DB/models/Holiday.model.js";

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
