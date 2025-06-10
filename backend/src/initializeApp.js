import connection from "../DB/connection.js";
import { globalError } from "./utils/asyncHandler.js";
import authRoutes from "./module/Auth/auth.routes.js";
import cors from 'cors' ;
import path from "path";
import departmentRouter from "./module/Department/Department.router.js";

const initializeApp = (app, express) => {
  app.use(express.json());
  app.use(cors());
  connection();
    app.use("/auth", authRoutes);


  // Register routes
  app.use('/api/department', departmentRouter);

  app.use(globalError);
  app.use("/{*any}", (req, res, next) => {
    res.status(404).json({
      success: false,
      message: `Can't find this route: ${req.originalUrl}`,
    });
      
  });
}

export default initializeApp;
