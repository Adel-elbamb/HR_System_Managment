import mongoose from "mongoose";
import monthlyPayroll from "../cron/EmployeesPayroll";

const connection = () => {
  mongoose
    .connect(process.env.URL)
    .then(() => {
      console.log("connection successfully");
      monthlyPayroll();
    })
    .catch((error) => {
      console.log("connection failed", error);
    });
};

export default connection;
