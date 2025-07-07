# HR System Management

## Overview

The HR System Management project is a comprehensive, modular web application designed to automate and streamline human resources operations for organizations. It provides robust tools for managing employees, attendance, payroll, departments, and holidays, with a focus on automation, accuracy, and ease of use.

## Main Modules & Features

### 1. Employee Management

- Add, update, delete, and restore employee records
- Manage personal information, department assignments, salary, working hours, and more
- Soft delete and restore functionality
- Unique constraints for email, address, phone, and national ID

### 2. Attendance Management

- Daily check-in/check-out tracking for employees
- Automatic calculation of late arrivals, overtime, and absences
- Cron jobs for automatic absent marking
- Attendance status management (present/absent/on leave)
- Automatic payroll updates on attendance changes

### 3. Payroll Management

- Automatic monthly payroll generation and updates based on attendance
- Calculates base salary, overtime, late and absence deductions, and net salary
- Overtime and deduction value configuration per employee
- Read-only payroll records (no manual creation or editing)
- Monthly payroll cron job

### 4. Department Management

- Create, update, and delete departments
- Assign employees to departments
- Prevent deletion of departments with assigned employees

### 5. Holiday Management

- Add, update, and delete official holidays
- Schedule holidays for future dates only
- Manage and list all company holidays

## System Features

- Authentication and authorization for HR users
- Data validation and error handling throughout the system
- Automatic calculations for salary per hour, working hours, and payroll
- Weekend day configuration per employee
- RESTful API endpoints for all modules
- AI-powered ChatBot for user assistance and system guidance

## Technologies Used

- **Node.js** & **Express.js** for backend API
- **MongoDB** with Mongoose for data storage and modeling
- **Google Gemini AI** for the ChatBot assistant
- **JWT** for authentication
- **Modern JavaScript (ES6+)**

## Best Practices

- Data validation before saving records
- Proper error handling for all operations
- Regular review and update of payroll calculations
- Monitoring overtime and late arrival patterns
- Regular backup of employee and payroll data

## Getting Started

1. Install dependencies: `npm install`
2. Configure environment variables (e.g., database URI, JWT secret, Gemini API key)
3. Start the server: `npm start`

## API Endpoints

- `/api/employee` - Employee management
- `/api/attendance` - Attendance management
- `/api/payroll` - Payroll management
- `/api/department` - Department management
- `/api/holiday` - Holiday management
- `/api/chatbot` - AI-powered ChatBot

## License

This project is provided for educational and organizational use. Please review the LICENSE file for details.
