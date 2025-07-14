import { asyncHandler } from "../../../utils/asyncHandler.js";
import AppError from "../../../utils/AppError.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

import employeeModel from "../../../../DB/models/Employee.model.js";
import departmentModel from "../../../../DB/models/Department.model.js";
import attendanceModel from "../../../../DB/models/Attendence.model.js";
import payrollModel from "../../../../DB/models/Payroll.model.js";
import holidayModel from "../../../../DB/models/Holiday.model.js";
import hrModel from "../../../../DB/models/HR.model.js";

// --- Model Introspection Utility ---
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

async function getAllModelsAndFields() {
  const modelsDir = path.resolve("DB/models");
  const modelFiles = fs.readdirSync(modelsDir).filter((f) => f.endsWith(".js"));
  const models = {};
  for (const file of modelFiles) {
    const modelPath = path.join(modelsDir, file);
    const modelModule = await import("file://" + modelPath);
    const modelExport = modelModule.default || modelModule;
    if (modelExport && modelExport.modelName && modelExport.schema) {
      models[modelExport.modelName] = Object.keys(modelExport.schema.paths);
    }
  }
  return models;
}

let PROJECT_MODELS = {};

// --- Natural Language Query Parser ---
/**
 * Enhanced: Parses a user question and tries to extract the model, fields, and complex filters.
 * Supports synonyms, partial matches, and advanced filter expressions.
 * @param {string} question
 * @param {object} modelsMap
 * @returns {object} { model, fields, filters }
 */
const FIELD_SYNONYMS = {
  // Employee
  firstName: ["first name", "given name", "fname", "name"],
  lastName: ["last name", "surname", "lname", "family name"],
  email: ["mail", "e-mail", "email address"],
  phone: ["mobile", "phone number", "contact"],
  department: ["dept", "division", "team"],
  hireDate: ["hired", "joined", "start date", "hire date", "joining date"],
  salary: ["wage", "pay", "base salary", "income"],
  workingHoursPerDay: ["work hours", "hours per day", "daily hours"],
  defaultCheckInTime: ["check in", "start time", "in time"],
  defaultCheckOutTime: ["check out", "end time", "out time"],
  address: ["location", "residence", "home"],
  gender: ["sex"],
  nationality: ["country", "citizenship"],
  birthdate: ["dob", "date of birth", "birthday"],
  nationalId: ["nid", "id number", "national id"],
  weekendDays: ["weekend", "off days"],
  overtimeValue: ["overtime rate", "ot value", "ot rate"],
  deductionValue: ["deduction rate", "deduct value"],
  salaryPerHour: ["hourly wage", "hourly rate"],
  isDeleted: ["deleted", "removed", "inactive"],
  // Attendance
  employeeId: ["employee", "staff", "person"],
  date: ["day", "attendance date"],
  checkInTime: ["check in", "in time"],
  checkOutTime: ["check out", "out time"],
  lateDurationInHours: ["late", "late hours", "lateness"],
  overtimeDurationInHours: ["overtime", "ot hours"],
  status: ["present", "absent", "on leave", "attendance status"],
  // Payroll
  month: ["pay month", "salary month"],
  year: ["pay year", "salary year"],
  monthDays: ["days in month"],
  attendedDays: ["present days", "attendance days"],
  absentDays: ["absent days"],
  totalOvertime: ["total ot", "total overtime"],
  totalBonusAmount: ["bonus", "total bonus"],
  totalDeduction: ["deduction", "total deduction"],
  totalDeductionAmount: ["deduction amount", "total deduction amount"],
  netSalary: ["net pay", "net income", "take home", "net salary"],
  // Department
  departmentName: ["department", "dept name", "team name"],
  // Holiday
  name: ["holiday name", "occasion"],
  // HR
  role: ["position", "job role"],
};

function getCanonicalField(modelFields, userField) {
  // Try exact match
  if (modelFields.includes(userField)) return userField;
  // Try synonym match
  for (const field of modelFields) {
    if (FIELD_SYNONYMS[field]) {
      for (const syn of FIELD_SYNONYMS[field]) {
        if (userField.includes(syn) || syn.includes(userField)) return field;
      }
    }
  }
  // Try partial match
  for (const field of modelFields) {
    if (field.toLowerCase().includes(userField)) return field;
  }
  return null;
}

function parseUserQuery(question, modelsMap) {
  const lowerQ = question.toLowerCase();
  // Try to find which model is being referenced (by name or synonym)
  let foundModel = null;
  for (const modelName of Object.keys(modelsMap)) {
    if (lowerQ.includes(modelName.toLowerCase())) {
      foundModel = modelName;
      break;
    }
    // Try plural
    if (lowerQ.includes(modelName.toLowerCase() + "s")) {
      foundModel = modelName;
      break;
    }
    // Try synonyms for model (e.g., "staff" for Employee)
    if (
      modelName === "Employee" &&
      /staff|personnel|worker|employee/.test(lowerQ)
    ) {
      foundModel = modelName;
      break;
    }
    if (modelName === "Department" && /team|division|department/.test(lowerQ)) {
      foundModel = modelName;
      break;
    }
    if (modelName === "Payroll" && /payroll|salary|wage|pay/.test(lowerQ)) {
      foundModel = modelName;
      break;
    }
    if (
      modelName === "Attendance" &&
      /attendance|check in|check out|present|absent/.test(lowerQ)
    ) {
      foundModel = modelName;
      break;
    }
    if (
      modelName === "OfficialHoliday" &&
      /holiday|leave|vacation|occasion/.test(lowerQ)
    ) {
      foundModel = modelName;
      break;
    }
    if (
      modelName === "HR" &&
      /hr|human resources|admin|administrator/.test(lowerQ)
    ) {
      foundModel = modelName;
      break;
    }
  }
  // Try to extract fields (by synonym, partial, or direct)
  let foundFields = [];
  if (foundModel) {
    for (const field of modelsMap[foundModel]) {
      if (lowerQ.includes(field.toLowerCase())) {
        foundFields.push(field);
        continue;
      }
      if (FIELD_SYNONYMS[field]) {
        for (const syn of FIELD_SYNONYMS[field]) {
          if (lowerQ.includes(syn)) {
            foundFields.push(field);
            break;
          }
        }
      }
    }
    // Try to extract generic fields (e.g., "name" matches firstName/lastName)
    if (foundFields.length === 0) {
      for (const field of modelsMap[foundModel]) {
        if (field.toLowerCase().includes("name") && lowerQ.includes("name")) {
          foundFields.push(field);
        }
      }
    }
  }
  // Try to extract complex filters (>, <, >=, <=, between, etc.)
  let filters = {};
  if (foundModel) {
    for (const field of modelsMap[foundModel]) {
      // Direct equality (is, =, equals, to)
      const eqRegex = new RegExp(`${field} (is|=|equals|to) ([^,?]+)`, "i");
      const eqMatch = question.match(eqRegex);
      if (eqMatch) {
        filters[field] = eqMatch[2].trim();
        continue;
      }
      // Greater than
      const gtRegex = new RegExp(
        `${field} (>|greater than|more than|above|at least) ([0-9.]+)`,
        "i"
      );
      const gtMatch = question.match(gtRegex);
      if (gtMatch) {
        filters[field] = { $gte: parseFloat(gtMatch[2]) };
        continue;
      }
      // Less than
      const ltRegex = new RegExp(
        `${field} (<|less than|below|under|at most) ([0-9.]+)`,
        "i"
      );
      const ltMatch = question.match(ltRegex);
      if (ltMatch) {
        filters[field] = { $lte: parseFloat(ltMatch[2]) };
        continue;
      }
      // Between
      const betweenRegex = new RegExp(
        `${field} (between|from) ([0-9.]+) (and|to) ([0-9.]+)`,
        "i"
      );
      const betweenMatch = question.match(betweenRegex);
      if (betweenMatch) {
        filters[field] = {
          $gte: parseFloat(betweenMatch[2]),
          $lte: parseFloat(betweenMatch[4]),
        };
        continue;
      }
      // Date (month/year)
      if (
        field.toLowerCase().includes("date") ||
        field === "month" ||
        field === "year"
      ) {
        // e.g., "in December 2024", "for 2023", "in June"
        const dateRegex = /in ([a-zA-Z]+) ?(\d{4})?/i;
        const dateMatch = question.match(dateRegex);
        if (dateMatch) {
          if (field === "month") {
            const monthNum =
              new Date(Date.parse(dateMatch[1] + " 1, 2000")).getMonth() + 1;
            filters[field] = monthNum;
          }
          if (field === "year" && dateMatch[2]) {
            filters[field] = parseInt(dateMatch[2]);
          }
        }
      }
    }
  }
  return { model: foundModel, fields: foundFields, filters };
}

// --- Aggregation/Group-By Query Parser ---
function parseAggregationIntent(question, modelsMap) {
  const lowerQ = question.toLowerCase();
  // Detect aggregation type
  let aggType = null;
  if (/count|number of|how many|total number/.test(lowerQ)) aggType = "count";
  else if (/sum|total(?! number)/.test(lowerQ)) aggType = "sum";
  else if (/average|avg|mean/.test(lowerQ)) aggType = "avg";
  else if (/minimum|min|lowest|smallest/.test(lowerQ)) aggType = "min";
  else if (/maximum|max|highest|largest/.test(lowerQ)) aggType = "max";

  // Detect group by (e.g., per department, by month)
  let groupBy = null;
  for (const modelName of Object.keys(modelsMap)) {
    for (const field of modelsMap[modelName]) {
      if (new RegExp(`per ${field}|by ${field}|grouped by ${field}|for each ${field}`, "i").test(lowerQ)) {
        groupBy = field;
        break;
      }
      if (FIELD_SYNONYMS[field]) {
        for (const syn of FIELD_SYNONYMS[field]) {
          if (new RegExp(`per ${syn}|by ${syn}|grouped by ${syn}|for each ${syn}`, "i").test(lowerQ)) {
            groupBy = field;
            break;
          }
        }
      }
    }
    if (groupBy) break;
  }

  // Detect aggregation field (e.g., overtime, salary)
  let aggField = null;
  for (const modelName of Object.keys(modelsMap)) {
    for (const field of modelsMap[modelName]) {
      if (lowerQ.includes(field.toLowerCase())) {
        aggField = field;
        break;
      }
      if (FIELD_SYNONYMS[field]) {
        for (const syn of FIELD_SYNONYMS[field]) {
          if (lowerQ.includes(syn)) {
            aggField = field;
            break;
          }
        }
      }
    }
    if (aggField) break;
  }

  return { aggType, groupBy, aggField };
}

// --- Aggregation Query Executor ---
async function executeAggregationQuery(modelName, aggType, groupBy, aggField, filters) {
  // Map model name to imported model
  const modelMap = {
    Employee: employeeModel,
    Department: departmentModel,
    Attendance: attendanceModel,
    Payroll: payrollModel,
    OfficialHoliday: holidayModel,
    HR: hrModel,
  };
  const model = modelMap[modelName];
  if (!model) return null;
  // Build aggregation pipeline
  let pipeline = [];
  if (filters && Object.keys(filters).length > 0) {
    pipeline.push({ $match: filters });
  }
  let groupStage = {};
  if (groupBy) {
    groupStage._id = `$${groupBy}`;
  } else {
    groupStage._id = null;
  }
  if (aggType === "count") {
    groupStage.count = { $sum: 1 };
  } else if (aggType === "sum" && aggField) {
    groupStage.total = { $sum: `$${aggField}` };
  } else if (aggType === "avg" && aggField) {
    groupStage.average = { $avg: `$${aggField}` };
  } else if (aggType === "min" && aggField) {
    groupStage.min = { $min: `$${aggField}` };
  } else if (aggType === "max" && aggField) {
    groupStage.max = { $max: `$${aggField}` };
  }
  pipeline.push({ $group: groupStage });
  // Optionally sort by group key
  if (groupBy) {
    pipeline.push({ $sort: { _id: 1 } });
  }
  return await model.aggregate(pipeline);
}

// --- Dynamic Query Builder ---
/**
 * Executes a dynamic Mongoose query based on the parsed user query.
 * @param {object} parsedQuery { model, fields, filters }
 * @returns {Promise<any>} Query result or null
 */
async function executeDynamicQuery(parsedQuery) {
  if (!parsedQuery.model) return null;
  // Map model name to imported model
  const modelMap = {
    Employee: employeeModel,
    Department: departmentModel,
    Attendance: attendanceModel,
    Payroll: payrollModel,
    OfficialHoliday: holidayModel,
    HR: hrModel,
  };
  const model = modelMap[parsedQuery.model];
  if (!model) return null;
  let query = model.find(parsedQuery.filters || {});
  if (parsedQuery.fields && parsedQuery.fields.length > 0) {
    query = query.select(parsedQuery.fields.join(" "));
  }
  // TODO: Add population and aggregation support as needed
  return await query.exec();
}

// System prompt that defines the chatbot's capabilities and context
const SYSTEM_PROMPT = `You are an AI assistant for an HR Management System. You can help with the following areas:

## USER INTERFACE INSTRUCTIONS
- Always guide users to use the HR Management System's web interface (client pages).
- For each feature (employee management, payroll, departments, holidays, etc.), explain which page to visit and which buttons or forms to use.
- Do NOT provide instructions for calling backend APIs or using tools like Postman.
- If a user asks how to perform an action, describe the steps in the client (web) app, e.g., "Go to the Employees page, click 'Add Employee', and fill out the form."
- If a feature is not available in the UI, politely inform the user.
- Provide detailed, step-by-step instructions for complex operations.
- Always explain the complete process, including what happens automatically in the background.

## SYSTEM DATA MODELS
You have access to the following data models and their fields:

### Employee
- firstName, lastName, email, phone, department, hireDate, salary, workingHoursPerDay, defaultCheckInTime, defaultCheckOutTime, address, gender, nationality, birthdate, nationalId, weekendDays, overtimeValue, deductionValue, salaryPerHour, isDeleted

### Department
- departmentName

### Attendance
- employeeId, date, checkInTime, checkOutTime, lateDurationInHours, overtimeDurationInHours, status (present/absent/On Leave)

### Payroll
- employeeId, month, year, monthDays, attendedDays, absentDays, totalOvertime, totalBonusAmount, totalDeduction, totalDeductionAmount, netSalary

### Holiday
- name, date

### HR
- email, password, name, role

## DATABASE SEARCH CAPABILITY
- You can search the database for information to answer user questions, but you are only allowed to perform read-only (SELECT) queries.
- Never perform any write, update, or delete operations.
- If a user asks for information that requires searching the database (e.g., "How many employees are in the Sales department?"), you may execute a safe search query and include the results in your answer.
- Always explain the source of your data if you use a database search.

## EMPLOYEE MANAGEMENT (Client)
- To view employees: Go to the Employees page from the sidebar.
- To add an employee: Click the 'Add Employee' button on the Employees or Dashboard page and fill out the form.
- To edit or delete an employee: Use the action buttons next to each employee in the Employees list.
- To search or filter: Use the search bar and filters at the top of the Employees page.

## ATTENDANCE MANAGEMENT (Client)
- Attendance is tracked automatically. To view attendance, check the Dashboard or relevant employee details.

## PAYROLL MANAGEMENT (Client)
- To view payroll: Go to the Payroll page from the sidebar.
- To search or filter payroll: Use the search bar and date filters at the top of the Payroll page.
- **IMPORTANT:** Payroll records are automatically generated and updated based on attendance. You cannot manually create or edit payroll records through the web interface.
- To update payroll: Update employee information (salary, working hours) or modify attendance records.

## DEPARTMENT MANAGEMENT (Client)
- To view departments: Go to the Departments page from the sidebar.
- To add a department: Click the 'Add Department' button and fill out the form.
- To edit or delete a department: Use the action buttons next to each department in the list.

## HOLIDAY MANAGEMENT (Client)
- To view holidays: Go to the Holidays page from the sidebar.
- To add a holiday: Use the form at the top of the Holidays page.
- To edit or delete a holiday: Use the action buttons next to each holiday in the list.

## DETAILED FEATURE INSTRUCTIONS

### EMPLOYEE MANAGEMENT - Step by Step
1. **Adding a New Employee:**
   - Navigate to the Employees page from the sidebar
   - Click the "Add Employee" button (usually in the top-right corner)
   - Fill out the employee form with required information:
     - First Name and Last Name
     - Email address
     - Phone number
     - Department (select from dropdown)
     - Base salary
     - Working hours per day
     - Hiring date
   - Click "Save" or "Add Employee" to create the employee record
   - The system will automatically assign a unique employee ID

2. **Editing an Employee:**
   - Go to the Employees page
   - Find the employee in the list
   - Click the "Edit" button (pencil icon) next to their name
   - Modify the information in the form
   - Click "Update" to save changes
   - The system will update the employee record immediately

3. **Deleting an Employee:**
   - Go to the Employees page
   - Find the employee in the list
   - Click the "Delete" button (trash icon) next to their name
   - Confirm the deletion in the popup dialog
   - The employee will be marked as deleted and moved to the deleted employees list

4. **Searching and Filtering Employees:**
   - Use the search bar at the top of the Employees page to search by name
   - Use the date filter to find employees hired on specific dates
   - The results will update automatically as you type

### PAYROLL MANAGEMENT - How It Actually Works

**IMPORTANT: Payroll is AUTOMATICALLY generated and updated based on attendance records. You cannot manually create or edit payroll records through the web interface.**

1. **How Payroll is Created:**
   - When you add a new employee, the system automatically creates a payroll record for the current month
   - The payroll record starts with 0 attended days and calculates absent days based on hire date
   - Base salary is taken from the employee's salary field

2. **How Payroll is Updated:**
   - **Every time an employee's attendance is recorded or updated, the payroll is automatically recalculated**
   - When an employee checks in/out, the system updates their payroll record
   - When attendance status changes (present/absent), payroll is updated
   - Overtime and late deductions are calculated automatically

3. **Viewing Payroll Records:**
   - Go to the Payroll page from the sidebar
   - You'll see a list of all payroll records (read-only)
   - Each record shows:
     - Employee name
     - Month and year
     - Attended days and absent days
     - Total overtime hours
     - Total bonus amount
     - Total deduction amount
     - Net salary
   - Use the search bar to find specific employees
   - Use month and year filters to view payroll for specific periods

4. **What You CAN Do:**
   - **View payroll records** - Go to Payroll page
   - **Search and filter** payroll by employee name, month, or year
   - **Update employee information** (salary, working hours, overtime/deduction rates) which will affect future payroll calculations

5. **What You CANNOT Do:**
   - Manually create payroll records
   - Manually edit payroll records
   - Add payroll records through the web interface
   - The "Add Payroll Record" button in the frontend is not functional

6. **To Update Payroll for an Employee:**
   - **Update the employee's information** (salary, working hours, overtime/deduction rates):
     1. Go to the Employees page
     2. Find the employee
     3. Click "Edit" next to their name
     4. Update their salary, working hours, overtime value, or deduction value
     5. Click "Save"
   - **Update attendance records** (this automatically updates payroll):
     1. Go to the Attendance page
     2. Find the employee's attendance record
     3. Update their check-in/check-out times or status
     4. The payroll will be automatically recalculated

7. **Payroll Calculations Explained:**
   - **Base Salary:** From employee's salary field
   - **Overtime Pay:** (Overtime hours * Employee's overtime value per hour)
   - **Late Deductions:** (Late hours * Employee's deduction value per hour)
   - **Absence Deductions:** (Absent days * Working hours per day * Salary per hour)
   - **Net Salary:** Base salary + Total bonus amount - Total deduction amount

8. **Automatic Processes:**
   - Payroll is created automatically when an employee is hired
   - Payroll is updated automatically when attendance is recorded
   - Payroll is recalculated when attendance is modified
   - All calculations happen in the background based on attendance data

### ATTENDANCE MANAGEMENT - How It Works
1. **Automatic Attendance Tracking:**
   - The system automatically tracks daily attendance
   - Employees are marked as present, absent, or on leave
   - Check-in and check-out times are recorded
   - Late arrivals and early departures are calculated automatically
   - Overtime hours are calculated based on working hours

2. **Viewing Attendance:**
   - Check the Dashboard for overall attendance statistics
   - View individual employee attendance in their details
   - The system shows present, absent, and on-leave counts

3. **Automatic Processes:**
   - Cron jobs run daily to mark absent employees
   - Working hours are calculated automatically
   - Salary per hour is computed from base salary and working hours
   - Weekend configurations are applied automatically

### DEPARTMENT MANAGEMENT - Step by Step
1. **Adding a Department:**
   - Go to the Departments page from the sidebar
   - Click the "Add Department" button
   - Enter the department name
   - Click "Save" to create the department

2. **Editing a Department:**
   - Find the department in the list
   - Click the "Edit" button next to the department name
   - Modify the department name
   - Click "Update" to save changes

3. **Deleting a Department:**
   - Find the department in the list
   - Click the "Delete" button next to the department name
   - Confirm the deletion
   - Note: Departments with assigned employees cannot be deleted

### HOLIDAY MANAGEMENT - Step by Step
1. **Adding a Holiday:**
   - Go to the Holidays page from the sidebar
   - Use the form at the top of the page
   - Enter the holiday name and date
   - Click "Add Holiday" to save
   - Only future dates are allowed for holiday scheduling

2. **Editing a Holiday:**
   - Find the holiday in the list
   - Click the "Edit" button next to the holiday
   - Modify the holiday name or date
   - Click "Update" to save changes

3. **Deleting a Holiday:**
   - Find the holiday in the list
   - Click the "Delete" button next to the holiday
   - Confirm the deletion

## SYSTEM FEATURES
- All main features are accessible via the sidebar navigation in the web interface.
- If you need help, describe what you want to do and I will guide you through the steps in the client.

## IMPORTANT NOTES
- Only provide information related to this HR system and its web interface.
- If asked about features not in this system, politely redirect to supported features.
- Be helpful and provide specific guidance on how to use the system.
- Explain calculations and processes clearly.
- Suggest best practices for HR management.

Remember: You are specifically designed to help with this HR Management System. Stay focused on the system's capabilities and provide practical, actionable advice for using the web interface.`;

export const chatBotController = asyncHandler(async (req, res, next) => {
  // Ensure PROJECT_MODELS is loaded
  if (Object.keys(PROJECT_MODELS).length === 0) {
    PROJECT_MODELS = await getAllModelsAndFields();
  }

  const { question } = req.body;

  if (!process.env.BOT_KEY) {
    return next(new AppError("Chatbot service is not configured", 500));
  }

  try {
    // --- Smart Multi-Model Query Handler ---
    const q = question.toLowerCase();
    // Pattern: Which employees in the [department] were [status] on [date]?
    const deptMatch = q.match(/in the ([a-zA-Z ]+) department/);
    const statusMatch = q.match(/were ([a-zA-Z ]+)(?: on|$)/);
    const dateMatch = q.match(
      /last friday|today|yesterday|on ([a-zA-Z0-9 ,\/]+)/
    );
    if (deptMatch && statusMatch) {
      // 1. Find department
      const deptName = deptMatch[1].trim();
      const department = await departmentModel.findOne({
        departmentName: new RegExp(deptName, "i"),
      });
      if (!department) {
        return res.status(200).json({
          message: `No department found with name '${deptName}'.`,
          results: [],
        });
      }
      // 2. Find employees in department
      const employees = await employeeModel.find({
        department: department._id,
      });
      if (!employees.length) {
        return res.status(200).json({
          message: `No employees found in department '${deptName}'.`,
          results: [],
        });
      }
      // 3. Find attendance records for those employees with status and date
      const empIds = employees.map((e) => e._id);
      let status = statusMatch[1].trim().toLowerCase();
      if (
        status === "absent" ||
        status === "present" ||
        status === "on leave"
      ) {
        // 4. Date logic
        let date;
        if (dateMatch) {
          if (dateMatch[0].includes("last friday")) {
            // Calculate last Friday
            const now = new Date();
            const day = now.getDay();
            const diff = day >= 5 ? day - 5 : 7 - (5 - day);
            const lastFriday = new Date(now);
            lastFriday.setDate(now.getDate() - diff - 7);
            date = new Date(lastFriday.toDateString());
          } else if (dateMatch[0].includes("today")) {
            date = new Date(new Date().toDateString());
          } else if (dateMatch[0].includes("yesterday")) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            date = new Date(yesterday.toDateString());
          } else if (dateMatch[1]) {
            date = new Date(dateMatch[1]);
          }
        }
        let attQuery = {
          employeeId: { $in: empIds },
          status: new RegExp(status, "i"),
        };
        if (date) attQuery.date = date;
        const attendance = await attendanceModel
          .find(attQuery)
          .populate("employeeId", "firstName lastName");
        if (!attendance.length) {
          return res.status(200).json({
            message: `No employees in ${deptName} were ${status}${
              date ? " on " + date.toDateString() : ""
            }.`,
            results: [],
          });
        }
        const names = attendance.map(
          (a) => `${a.employeeId.firstName} ${a.employeeId.lastName}`
        );
        return res.status(200).json({
          message: `The following employees in ${deptName} were ${status}${
            date ? " on " + date.toDateString() : ""
          }: ${names.join(", ")}`,
          results: names,
        });
      }
    }
    // Pattern: How many employees attended today
    if (/how many employees attended today/.test(q)) {
      const today = new Date(new Date().toDateString());
      const attendance = await attendanceModel.find({
        date: today,
        status: /present/i,
      });
      return res.status(200).json({
        message: `Number of employees who attended today: ${attendance.length}`,
        results: attendance.map((a) => a.employeeId),
      });
    }
    // --- End Smart Handler ---

    // --- Full Report Handler ---
    const fullReportMatch = q.match(/full report about ([a-zA-Z ]+)/);
    if (fullReportMatch) {
      const name = fullReportMatch[1].trim();
      // Find employee by name (first, last, or full name)
      const employees = await employeeModel
        .find({
          $or: [
            { firstName: new RegExp(name, "i") },
            { lastName: new RegExp(name, "i") },
          ],
        })
        .populate("department");
      // Try to match full name if multiple or no results
      let employee = null;
      if (employees.length === 1) {
        employee = employees[0];
      } else if (employees.length > 1) {
        employee = employees.find(
          (e) =>
            `${e.firstName} ${e.lastName}`.toLowerCase() === name.toLowerCase()
        );
      }
      if (!employee) {
        // Try direct full name match if not found
        employee = await employeeModel
          .findOne({
            $expr: {
              $eq: [{ $concat: ["$firstName", " ", "$lastName"] }, name],
            },
          })
          .populate("department");
      }
      if (!employee) {
        return res.status(200).json({
          message: `No employee found with name '${name}'.`,
          results: [],
        });
      }
      // Gather attendance (last 5 records)
      const attendanceRecords = await attendanceModel
        .find({ employeeId: employee._id })
        .sort({ date: -1 })
        .limit(5);
      // Gather payroll (latest record)
      const payroll = await payrollModel
        .findOne({ employeeId: employee._id })
        .sort({ year: -1, month: -1 });
      // Format report
      let report = `Full Report for ${employee.firstName} ${employee.lastName} (ID: ${employee._id}):\n`;
      report += `- Department: ${
        employee.department?.departmentName || "N/A"
      }\n`;
      report += `- Email: ${employee.email || "N/A"}\n`;
      report += `- Phone: ${employee.phone || "N/A"}\n`;
      report += `- Hire Date: ${
        employee.hireDate
          ? employee.hireDate.toISOString().split("T")[0]
          : "N/A"
      }\n`;
      report += `- Salary: ${employee.salary || "N/A"}\n`;
      report += `- Working Hours/Day: ${
        employee.workingHoursPerDay || "N/A"
      }\n`;
      report += `- Overtime Value: ${employee.overtimeValue || "N/A"}\n`;
      report += `- Deduction Value: ${employee.deductionValue || "N/A"}\n`;
      report += `\nAttendance (Last 5 Records):\n`;
      if (attendanceRecords.length) {
        attendanceRecords.forEach((a) => {
          report += `  - ${a.date.toISOString().split("T")[0]}: ${
            a.status
          }, Check-in: ${a.checkInTime || "N/A"}, Check-out: ${
            a.checkOutTime || "N/A"
          }, Late: ${a.lateDurationInHours || 0}h, Overtime: ${
            a.overtimeDurationInHours || 0
          }h\n`;
        });
      } else {
        report += "  No attendance records found.\n";
      }
      report += `\nPayroll (Latest):\n`;
      if (payroll) {
        report += `  - Month/Year: ${payroll.month}/${payroll.year}\n`;
        report += `  - Net Salary: ${payroll.netSalary}\n`;
        report += `  - Attended Days: ${payroll.attendedDays}\n`;
        report += `  - Absent Days: ${payroll.absentDays}\n`;
        report += `  - Overtime: ${payroll.totalOvertime}h (Bonus: ${payroll.totalBonusAmount})\n`;
        report += `  - Late: ${payroll.totalDeduction}h (Deduction: ${payroll.totalDeductionAmount})\n`;
      } else {
        report += "  No payroll records found.\n";
      }
      return res.status(200).json({ message: report, results: [employee._id] });
    }
    // --- End Full Report Handler ---

    // --- New Autonomous Project-Aware Logic ---
    // 1. Parse the question
    const parsedQuery = parseUserQuery(question, PROJECT_MODELS);
    // 1b. Parse aggregation intent
    const aggIntent = parseAggregationIntent(question, PROJECT_MODELS);
    // 2. If aggregation is requested, run aggregation pipeline
    if (parsedQuery.model && aggIntent.aggType) {
      const aggResult = await executeAggregationQuery(
        parsedQuery.model,
        aggIntent.aggType,
        aggIntent.groupBy,
        aggIntent.aggField,
        parsedQuery.filters
      );
      if (aggResult && aggResult.length > 0) {
        // Format aggregation result for response
        let summary = "";
        if (aggIntent.aggType === "count" && aggIntent.groupBy) {
          summary = aggResult
            .map((r) => `${aggIntent.groupBy}: ${r._id || "N/A"} - Count: ${r.count}`)
            .join("; ");
        } else if (aggIntent.aggType === "count") {
          summary = `Count: ${aggResult[0].count}`;
        } else if (aggIntent.aggType === "sum") {
          if (aggIntent.groupBy) {
            summary = aggResult
              .map((r) => `${aggIntent.groupBy}: ${r._id || "N/A"} - Total: ${r.total}`)
              .join("; ");
          } else {
            summary = `Total ${aggIntent.aggField}: ${aggResult[0].total}`;
          }
        } else if (aggIntent.aggType === "avg") {
          if (aggIntent.groupBy) {
            summary = aggResult
              .map((r) => `${aggIntent.groupBy}: ${r._id || "N/A"} - Average: ${r.average}`)
              .join("; ");
          } else {
            summary = `Average ${aggIntent.aggField}: ${aggResult[0].average}`;
          }
        } else if (aggIntent.aggType === "min") {
          if (aggIntent.groupBy) {
            summary = aggResult
              .map((r) => `${aggIntent.groupBy}: ${r._id || "N/A"} - Min: ${r.min}`)
              .join("; ");
          } else {
            summary = `Min ${aggIntent.aggField}: ${aggResult[0].min}`;
          }
        } else if (aggIntent.aggType === "max") {
          if (aggIntent.groupBy) {
            summary = aggResult
              .map((r) => `${aggIntent.groupBy}: ${r._id || "N/A"} - Max: ${r.max}`)
              .join("; ");
          } else {
            summary = `Max ${aggIntent.aggField}: ${aggResult[0].max}`;
          }
        }
        return res.status(200).json({
          message: summary,
          results: aggResult,
        });
      } else {
        return res.status(200).json({
          message: `No aggregation results found for your query on ${parsedQuery.model}.`,
          results: [],
        });
      }
    }
    // 2. If a model is found, execute the query
    if (parsedQuery.model) {
      const result = await executeDynamicQuery(parsedQuery);
      // 3. Format a concise, relevant answer
      if (result && result.length > 0) {
        // Try to extract key fields for a human-friendly summary
        let summary = "";
        if (parsedQuery.model === "Employee") {
          summary = result
            .map((r) => `${r.firstName || ""} ${r.lastName || ""}`.trim())
            .filter(Boolean)
            .join(", ");
          if (summary) summary = `Employees: ${summary}`;
        } else if (parsedQuery.model === "Department") {
          summary = result
            .map((r) => r.departmentName)
            .filter(Boolean)
            .join(", ");
          if (summary) summary = `Departments: ${summary}`;
        } else if (parsedQuery.model === "Attendance") {
          summary = result
            .map((r) =>
              `${r.employeeId?.firstName || ""} ${
                r.employeeId?.lastName || ""
              }`.trim()
            )
            .filter(Boolean)
            .join(", ");
          if (summary) summary = `Attendance records for: ${summary}`;
        } else if (parsedQuery.model === "Payroll") {
          summary = result
            .map(
              (r) =>
                `${r.employeeId?.firstName || ""} ${
                  r.employeeId?.lastName || ""
                }: Net Salary ${r.netSalary}`
            )
            .filter(Boolean)
            .join("; ");
          if (summary) summary = `Payroll: ${summary}`;
        } else if (parsedQuery.model === "OfficialHoliday") {
          summary = result
            .map((r) => `${r.name} (${r.date})`)
            .filter(Boolean)
            .join(", ");
          if (summary) summary = `Holidays: ${summary}`;
        } else if (parsedQuery.model === "HR") {
          summary = result
            .map((r) => r.name)
            .filter(Boolean)
            .join(", ");
          if (summary) summary = `HRs: ${summary}`;
        }
        if (!summary)
          summary = `Found ${result.length} result(s) for your query on ${parsedQuery.model}.`;
        return res.status(200).json({
          message: summary,
          results: result.slice(0, 3),
        });
      } else {
        return res.status(200).json({
          message: `No results found for your query on ${parsedQuery.model}.`,
          results: [],
        });
      }
    }
    // --- End New Logic ---

    if (!process.env.BOT_KEY) {
      return next(new AppError("Chatbot service is not configured", 500));
    }

    try {
      const lowerQ = question.toLowerCase();
      // General-purpose question parser and database search logic
      let generalResultText = "";
      let found = false;
      // Extract keywords
      const keywords = lowerQ.split(/\W+/).filter(Boolean);
      // Helper: extract time filter
      function extractTimeFilter(q) {
        const now = new Date();
        let month = null,
          year = null;
        let filterText = "";
        if (/last month/i.test(q)) {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          month = lastMonth.getMonth() + 1;
          year = lastMonth.getFullYear();
          filterText = "last month";
        } else if (/this month/i.test(q)) {
          month = now.getMonth() + 1;
          year = now.getFullYear();
          filterText = "this month";
        } else {
          const m = q.match(/in ([a-zA-Z]+)(?: (\d{4}))?/i);
          if (m) {
            month = new Date(Date.parse(m[1] + " 1, 2000")).getMonth() + 1;
            year = m[2] ? parseInt(m[2]) : now.getFullYear();
            filterText = m[0];
          }
        }
        return { month, year, filterText };
      }
      // Check for employee name
      let empName = null;
      let emp = null;
      let employees = [];
      // Try to extract a name (assume name is after 'for' or 'of')
      let nameMatch = question.match(/(?:for|of) (employee )?([a-zA-Z ]+)/i);
      let timeFilter = extractTimeFilter(question);
      if (nameMatch) {
        empName = nameMatch[2].trim();
        // Remove time filter text from name if present
        if (timeFilter.filterText) {
          empName = empName
            .replace(new RegExp(timeFilter.filterText, "i"), "")
            .trim();
        }
      }
      if (empName) {
        const nameParts = empName.split(" ").filter(Boolean);
        if (nameParts.length === 1) {
          employees = await employeeModel.find({
            $or: [
              { firstName: new RegExp(nameParts[0], "i") },
              { lastName: new RegExp(nameParts[0], "i") },
            ],
          });
        } else if (nameParts.length >= 2) {
          emp = await employeeModel.findOne({
            firstName: new RegExp(nameParts[0], "i"),
            lastName: new RegExp(nameParts.slice(1).join(" "), "i"),
          });
          if (!emp) {
            employees = await employeeModel.find({
              $or: [
                { firstName: new RegExp(nameParts[0], "i") },
                { lastName: new RegExp(nameParts[nameParts.length - 1], "i") },
              ],
            });
          } else {
            employees = [emp];
          }
        }
        if (employees.length === 1) {
          emp = employees[0];
        } else if (employees.length > 1) {
          const names = employees
            .map((e) => `${e.firstName} ${e.lastName || ""}`.trim())
            .join(", ");
          generalResultText = `Multiple employees found matching '${empName}': ${names}. Please specify the full name.`;
          found = true;
        } else {
          generalResultText = `Employee '${empName}' does not exist.`;
          found = true;
        }
      }
      // If employee found, check what info is requested
      if (emp && !found) {
        // Net Salary/Payroll
        if (
          (keywords.includes("net") && keywords.includes("salary")) ||
          keywords.includes("payroll")
        ) {
          let month = timeFilter.month;
          let year = timeFilter.year;
          let payrollQuery = { employeeId: emp._id };
          if (month) payrollQuery.month = month;
          if (year) payrollQuery.year = year;
          else payrollQuery.year = new Date().getFullYear();
          const payroll = await payrollModel.findOne(payrollQuery);
          if (payroll) {
            const monthName = month
              ? new Date(2000, month - 1, 1).toLocaleString("default", {
                  month: "long",
                })
              : "current month";
            generalResultText = `The net salary for ${emp.firstName} ${
              emp.lastName || ""
            } in ${monthName} ${payroll.year} is ${payroll.netSalary} EGP.`;
          } else {
            generalResultText = `Payroll for ${emp.firstName} ${
              emp.lastName || ""
            } in the specified period does not exist.`;
          }
          found = true;
        }
        // Base Salary
        else if (keywords.includes("salary")) {
          generalResultText = `The salary for ${emp.firstName} ${
            emp.lastName || ""
          } is ${emp.salary} EGP.`;
          found = true;
        }
        // Attendance
        else if (keywords.includes("attendance")) {
          const attendance = await attendanceModel.find({
            employeeId: emp._id,
          });
          if (attendance.length > 0) {
            generalResultText = `Attendance records for ${emp.firstName} ${
              emp.lastName || ""
            }: ${attendance.length} records.`;
          } else {
            generalResultText = `Attendance for ${emp.firstName} ${
              emp.lastName || ""
            } does not exist.`;
          }
          found = true;
        }
        // Overtime
        else if (keywords.includes("overtime")) {
          const payrolls = await payrollModel.find({ employeeId: emp._id });
          if (payrolls.length > 0) {
            const totalOvertime = payrolls.reduce(
              (sum, p) => sum + (p.totalOvertime || 0),
              0
            );
            generalResultText = `Total overtime for ${emp.firstName} ${
              emp.lastName || ""
            } is ${totalOvertime} hours.`;
          } else {
            generalResultText = `Overtime for ${emp.firstName} ${
              emp.lastName || ""
            } does not exist.`;
          }
          found = true;
        }
        // Department
        else if (keywords.includes("department")) {
          if (emp.department && emp.department.departmentName) {
            generalResultText = `${emp.firstName} ${
              emp.lastName || ""
            } is in the ${emp.department.departmentName} department.`;
          } else {
            generalResultText = `Department for ${emp.firstName} ${
              emp.lastName || ""
            } does not exist.`;
          }
          found = true;
        }
      }
      // Department info (not about employee)
      if (!found && keywords.includes("department")) {
        let deptNameMatch = question.match(/department (named )?([a-zA-Z ]+)/i);
        let deptName = null;
        if (deptNameMatch) deptName = deptNameMatch[2].trim();
        if (deptName) {
          const dept = await departmentModel.findOne({
            departmentName: new RegExp(deptName, "i"),
          });
          if (dept) {
            generalResultText = `Department '${dept.departmentName}' exists.`;
          } else {
            generalResultText = `Department '${deptName}' does not exist.`;
          }
          found = true;
        }
      }
      // Holiday info
      if (!found && keywords.includes("holiday")) {
        let holidayNameMatch = question.match(/holiday (named )?([a-zA-Z ]+)/i);
        let holidayName = null;
        if (holidayNameMatch) holidayName = holidayNameMatch[2].trim();
        if (holidayName) {
          const holiday = await holidayModel.findOne({
            name: new RegExp(holidayName, "i"),
          });
          if (holiday) {
            generalResultText = `Holiday '${holiday.name}' is on ${
              holiday.date.toISOString().split("T")[0]
            }.`;
          } else {
            generalResultText = `Holiday '${holidayName}' does not exist.`;
          }
          found = true;
        } else {
          // List all holidays
          const holidays = await holidayModel.find({});
          if (holidays.length > 0) {
            generalResultText = `Holidays: ${holidays
              .map((h) => `${h.name} (${h.date.toISOString().split("T")[0]})`)
              .join(", ")}`;
          } else {
            generalResultText = `No holidays exist.`;
          }
          found = true;
        }
      }
      // If a direct answer was found, return it immediately
      if (found && generalResultText) {
        return res.status(200).json({
          success: true,
          message: "Chatbot response generated successfully",
          data: {
            question,
            answer: generalResultText,
            timestamp: new Date().toISOString(),
            dbResult: generalResultText,
          },
        });
      }

      // Initialize Google Gemini AI with API key
      const genAI = new GoogleGenerativeAI(process.env.BOT_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Create the full prompt with user question and (if present) db result
      const fullPrompt = `${SYSTEM_PROMPT}

User Question: ${question}
${generalResultText ? `\n${generalResultText}` : ""}
Please provide a helpful, accurate response based on the HR system capabilities described above.`;

      // Generate response
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      let text = response.text();
      console.log(text);

      // Post-process the response for conciseness
      let conciseAnswer = text;
      if (
        lowerQ.includes("step") ||
        lowerQ.includes("how do i") ||
        lowerQ.includes("how to")
      ) {
        // Extract only the steps (numbered or bulleted list)
        const stepsMatch = text.match(/(\d+\. .+|\- .+)([\s\S]*)/);
        if (stepsMatch) {
          // Get all lines that look like steps
          const lines = text
            .split("\n")
            .filter((line) => line.match(/^\d+\. |^- /));
          if (lines.length > 0) {
            conciseAnswer = lines.join("\n");
          }
        }
      } else if (
        lowerQ.includes("net salary for") ||
        lowerQ.includes("salary for") ||
        lowerQ.includes("attendance for") ||
        lowerQ.includes("payroll for")
      ) {
        // Extract only the value or direct answer
        // Try to find a line with the value
        const valueLine = text
          .split("\n")
          .find(
            (line) =>
              line.toLowerCase().includes("net salary") ||
              line.toLowerCase().includes("salary") ||
              line.toLowerCase().includes("attendance") ||
              line.toLowerCase().includes("payroll")
          );
        if (valueLine) {
          conciseAnswer = valueLine;
        }
      } else {
        // For all other cases, return only the first sentence or direct answer
        const firstLine = text
          .split("\n")
          .find((line) => line.trim().length > 0);
        if (firstLine) {
          conciseAnswer = firstLine;
        }
      }
      console.log(conciseAnswer);
      res.status(200).json({
        success: true,
        message: "Chatbot response generated successfully",
        data: {
          question,
          answer: conciseAnswer,
          timestamp: new Date().toISOString(),
          dbResult: generalResultText || undefined,
        },
      });
    } catch (error) {
      console.error("Chatbot Error:", error);
      return next(
        new AppError(
          "Failed to generate response. Please try again later.",
          500
        )
      );
    }
  } catch (error) {
    console.error("Chatbot Error:", error);
    return next(
      new AppError("Failed to generate response. Please try again later.", 500)
    );
  }
});
