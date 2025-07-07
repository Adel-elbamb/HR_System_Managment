import { asyncHandler } from "../../../utils/asyncHandler.js";
import AppError from "../../../utils/AppError.js";
import holidayModel from "../../../../DB/models/Holiday.model.js";

export const createHoliday = asyncHandler(async (req, res, next) => {
  const { date, name } = req.body;
  if (!date || !name) {
    return next(new AppError("All fields are required", 400));
  }

  // Validate that the holiday date is not today or in the past
  const holidayDate = new Date(date);
  const today = new Date();

  if (holidayDate <= today) {
    return next(
      new AppError("Holiday date cannot be today or in the past", 400)
    );
  }

  const holiday = await holidayModel.create({ date, name });
  res.status(201).json({
    success: true,
    message: "Holiday created successfully",
    holiday,
  });
});
