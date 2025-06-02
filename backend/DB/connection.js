import mongoose from "mongoose";
const url = process.env.URL ||"mongodb://localhost:27017/hr_system";
const connection = () => {
  mongoose
    .connect(url)
    .then(() => {
      console.log("connection successfully");
    })
    .catch((error) => {
      console.log("connection failed", error);
    });
};

export default connection;
