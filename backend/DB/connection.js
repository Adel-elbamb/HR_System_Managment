import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); 
const connection = () => {
  mongoose
    .connect(process.env.URL)
    .then(() => {
      console.log("connection successfully");
    })
    .catch((error) => {
      console.log("connection failed", error);
    });
};

export default connection;
