import connection from "../DB/connection.js";
import { globalError } from "./utils/asyncHandler.js";
import authRoutes from "./module/Auth/auth.routes.js";
import cors from "cors";
import path from "path";
import PayRoll from "./module/PayRoll/payroll.routes.js";
import AttendanceRouter from "./module/Attendance/Attendance.routes.js";
import holidayRouter from "./module/holiday/holiday.routes.js";
import departmentRouter from "./module/Department/Department.routes.js";
import EmployeeRouter from "./module/Employee/Employee.routes.js";
import { auth } from "./middleware/auth.js";

const initializeApp = (app, express) => {
  app.use(express.json());
  app.use(cors());
  connection();

  app.use("/api/auth", authRoutes);
  app.use(auth);
  app.use("/attendance", AttendanceRouter);
  app.use("/api/holiday", holidayRouter);
  app.use("/api/employee", EmployeeRouter);
  // Register routes
  app.use("/api/department", departmentRouter);
  app.use("/api/payroll", PayRoll);

  app.use(globalError);
  app.use("/{*any}", (req, res, next) => {
    res.status(404).json({
      success: false,
      message: `Can't find this route: ${req.originalUrl}`,
    });
  });
};

export default initializeApp;
