import { asyncHandler } from "../../../utils/asyncHandler.js";
import AppError from "../../../utils/AppError.js";
import holidayModel from "../../../../DB/models/Holiday.model.js";

export const updateHoliday = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { date, name } = req.body;

  // Validate that the holiday date is not today or in the past
  if (date) {
    const holidayDate = new Date(date);
    const today = new Date();

    if (holidayDate <= today) {
      return next(
        new AppError("Holiday date cannot be today or in the past", 400)
      );
    }
  }

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
    holiday: updateHoliday,
  });
});
