import connection from "../DB/connection.js";
import { globalError } from "./utils/asyncHandler.js";
import cors from 'cors' ;
import path from "path";

const initializeApp = (app, express) => {
  app.use(express.json());
  connection();


  app.use(globalError);
  app.use("/{*any}", (req, res, next) => {
    res.status(404).json({
      success: false,
      message: `Can't find this route: ${req.originalUrl}`,
    });
      
  });
}

export default initializeApp;
