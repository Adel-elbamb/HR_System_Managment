// ChatBot Configuration for HR Management System
export const CHATBOT_CONFIG = {
  // System Information
  systemName: "HR Management System",
  version: "1.0.0",

  // Available Modules
  modules: {
    employee: {
      name: "Employee Management",
      description: "Manage employee information, hiring, updates, and deletion",
      endpoints: [
        "POST /api/employee - Add new employee",
        "GET /api/employee - Get all employees",
        "GET /api/employee/:id - Get specific employee",
        "PUT /api/employee/:id - Update employee",
        "DELETE /api/employee/:id - Delete employee",
        "GET /api/employee/deleted - Get deleted employees",
        "PATCH /api/employee/restore/:id - Restore deleted employee",
      ],
      features: [
        "Employee personal information",
        "Department assignment",
        "Salary and working hours configuration",
        "Overtime and deduction values",
        "Weekend day settings",
        "Soft delete and restore functionality",
      ],
    },

    attendance: {
      name: "Attendance Management",
      description:
        "Track daily attendance, late arrivals, overtime, and absences",
      endpoints: [
        "POST /api/attendance - Add attendance record",
        "GET /api/attendance - Get all attendance records",
        "GET /api/attendance/:id - Get specific attendance",
        "PUT /api/attendance/:id - Update attendance",
        "DELETE /api/attendance/:id - Delete attendance",
      ],
      features: [
        "Daily check-in/check-out tracking",
        "Late duration calculation",
        "Overtime duration calculation",
        "Automatic absent marking via cron job",
        "Attendance status management (present/absent/on leave)",
        "Automatic payroll updates on attendance changes",
      ],
    },

    payroll: {
      name: "Payroll Management",
      description:
        "Calculate monthly salaries, deductions, bonuses, and net pay",
      endpoints: [
        "GET /api/payroll - Get all payroll records",
        "GET /api/payroll/:id - Get specific payroll",
      ],
      features: [
        "Monthly salary calculations",
        "Overtime bonus calculations",
        "Late arrival deductions",
        "Absence deductions",
        "Net salary computation",
        "Automatic payroll generation for new employees",
        "Monthly payroll cron job",
      ],
    },

    department: {
      name: "Department Management",
      description: "Manage company departments and employee assignments",
      endpoints: [
        "POST /api/department - Add new department",
        "GET /api/department - Get all departments",
        "GET /api/department/:id - Get specific department",
        "PUT /api/department/:id - Update department",
        "DELETE /api/department/:id - Delete department",
      ],
      features: [
        "Department creation and management",
        "Employee department assignment",
        "Department information tracking",
      ],
    },

    holiday: {
      name: "Holiday Management",
      description: "Manage official holidays and company days off",
      endpoints: [
        "POST /api/holiday - Add new holiday",
        "GET /api/holiday - Get all holidays",
        "GET /api/holiday/:id - Get specific holiday",
        "PUT /api/holiday/:id - Update holiday",
        "DELETE /api/holiday/:id - Delete holiday",
      ],
      features: [
        "Official holiday scheduling",
        "Future date validation",
        "Holiday information management",
      ],
    },
  },

  // Calculation Rules
  calculations: {
    salary: {
      absentDeduction: "absent days * working hours per day * salary per hour",
      lateDeduction: "late hours * deduction value",
      overtimeBonus: "overtime hours * overtime value",
      netSalary: "base salary + total bonus - total deductions",
    },

    attendance: {
      lateCalculation: "Check-in time > default check-in time",
      overtimeCalculation: "Check-out time > default check-out time",
      workingHours: "default check-out time - default check-in time",
    },
  },

  // System Features
  systemFeatures: [
    "Automatic payroll calculations based on attendance",
    "Cron jobs for automatic absent marking",
    "Working hours calculation",
    "Salary per hour calculations",
    "Weekend day configurations",
    "Soft delete functionality",
    "Data validation and error handling",
    "Authentication and authorization",
  ],

  // Best Practices
  bestPractices: [
    "Always validate employee data before saving",
    "Use proper error handling for all operations",
    "Keep attendance records accurate and up-to-date",
    "Regularly review and update payroll calculations",
    "Maintain proper department structure",
    "Plan holidays well in advance",
    "Monitor overtime and late arrival patterns",
    "Regular backup of employee and payroll data",
  ],
};

// Common questions and their categories
export const COMMON_QUESTIONS = {
  employee: [
    "How do I add a new employee?",
    "How do I update employee information?",
    "How do I delete an employee?",
    "How do I restore a deleted employee?",
    "What employee information is required?",
    "How do I assign an employee to a department?",
  ],

  attendance: [
    "How do I record daily attendance?",
    "How is late arrival calculated?",
    "How is overtime calculated?",
    "How do I update attendance records?",
    "What happens if an employee doesn't check in?",
    "How do I mark an employee as absent?",
  ],

  payroll: [
    "How is salary calculated?",
    "How are deductions calculated?",
    "How are bonuses calculated?",
    "What is the net salary formula?",
    "How do I view payroll records?",
    "When is payroll automatically generated?",
  ],

  department: [
    "How do I create a new department?",
    "How do I assign employees to departments?",
    "How do I update department information?",
    "How do I delete a department?",
  ],

  holiday: [
    "How do I add a new holiday?",
    "Can I set holidays for past dates?",
    "How do I update holiday information?",
    "How do I delete a holiday?",
  ],
};
