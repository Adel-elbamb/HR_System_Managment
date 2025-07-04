import express from "express";
import dotenv from "dotenv";
import initializeApp from "./src/initializeApp.js";
import path from "path";
// Import MarkAbsentees cron job to auto-mark absentees and trigger payroll deduction
import "./cron/MarkAbsentees.js";
dotenv.config({ path: path.resolve("./config/.env") });
const port = process.env.PORT || 3000;
const app = express();
initializeApp(app, express);

app.listen(port, () => {
  console.log(`Server running successfully on port ${port}`);
});
