import { asyncHandler } from "../../../utils/asyncHandler.js";
import holidayModel from "../../../../DB/models/Holiday.model.js";

export const allHoliday = asyncHandler(async (req, res, next) => {
  const holiday = await holidayModel.find();

  return res.status(200).json({
    success: true,
    message: "all holidays",
    holiday,
  });
});
