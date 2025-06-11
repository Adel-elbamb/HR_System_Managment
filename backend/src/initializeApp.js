import connection from "../DB/connection.js";
import { globalError } from "./utils/asyncHandler.js";
import authRoutes from "./module/Auth/auth.routes.js";
import cors from "cors";
import path from "path";

import holidayRouter from "./module/holiday/holiday.router.js";
import departmentRouter from "./module/Department/Department.router.js";
import EmployeeRouter from "./module/Employee/Employee.router.js";

const initializeApp = (app, express) => {
  app.use(express.json());
  app.use(cors());
  connection();
  app.use("/auth", authRoutes);

  app.use("/holiday", holidayRouter);
  app.use("/employee", EmployeeRouter);
  // Register routes
  app.use("/api/department", departmentRouter);

  app.use(globalError);
  app.use("/{*any}", (req, res, next) => {
    res.status(404).json({
      success: false,
      message: `Can't find this route: ${req.originalUrl}`,
    });
  });
};

export default initializeApp;
