import mongoose from "mongoose";
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
