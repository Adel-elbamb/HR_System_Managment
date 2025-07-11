// Test Examples for HR Management System ChatBot
// This file contains example API calls to test the chatbot functionality

const BASE_URL = "http://localhost:3000/api";
const AUTH_TOKEN = "your_jwt_token_here"; // Replace with actual token

// Example API calls for testing the chatbot
const testExamples = {
  // Employee Management Questions
  employeeQuestions: [
    {
      question: "How do I add a new employee to the system?",
      description: "Basic employee creation process",
    },
    {
      question: "What information is required when creating an employee?",
      description: "Required fields for employee creation",
    },
    {
      question: "How do I update an employee's salary?",
      description: "Salary update process",
    },
    {
      question: "How do I assign an employee to a department?",
      description: "Department assignment process",
    },
    {
      question: "How do I restore a deleted employee?",
      description: "Employee restoration process",
    },
  ],

  // Attendance Management Questions
  attendanceQuestions: [
    {
      question: "How do I record daily attendance for employees?",
      description: "Daily attendance recording",
    },
    {
      question: "How is late arrival calculated?",
      description: "Late arrival calculation logic",
    },
    {
      question: "How is overtime calculated?",
      description: "Overtime calculation process",
    },
    {
      question: "What happens if an employee doesn't check in?",
      description: "Automatic absent marking",
    },
    {
      question: "How do I update attendance records?",
      description: "Attendance record updates",
    },
  ],

  // Payroll Management Questions
  payrollQuestions: [
    {
      question: "How is employee salary calculated?",
      description: "Salary calculation process",
    },
    {
      question: "What deductions are applied to salary?",
      description: "Salary deduction types",
    },
    {
      question: "How are bonuses calculated?",
      description: "Bonus calculation process",
    },
    {
      question: "What is the net salary formula?",
      description: "Net salary calculation",
    },
    {
      question: "When is payroll automatically generated?",
      description: "Automatic payroll generation",
    },
  ],

  // Department Management Questions
  departmentQuestions: [
    {
      question: "How do I create a new department?",
      description: "Department creation process",
    },
    {
      question: "How do I assign employees to departments?",
      description: "Employee department assignment",
    },
    {
      question: "How do I update department information?",
      description: "Department updates",
    },
  ],

  // Holiday Management Questions
  holidayQuestions: [
    {
      question: "How do I add a new holiday?",
      description: "Holiday creation process",
    },
    {
      question: "Can I set holidays for past dates?",
      description: "Holiday date validation",
    },
    {
      question: "How do I update holiday information?",
      description: "Holiday updates",
    },
  ],

  // System General Questions
  generalQuestions: [
    {
      question: "What are the main features of this HR system?",
      description: "System overview",
    },
    {
      question: "How does the automatic payroll calculation work?",
      description: "Automatic calculations",
    },
    {
      question: "What are the working hours calculation rules?",
      description: "Working hours logic",
    },
    {
      question: "How do I handle employee absences?",
      description: "Absence management",
    },
  ],
};

// --- Autonomous Project-Aware Query Tests ---
testExamples.autonomousQueryQuestions = [
  {
    question:
      "List all employees in the IT department who were absent last Friday.",
    description:
      "Cross-model query: Employee + Department + Attendance, with date filter.",
  },
  {
    question:
      "Show payroll records for employees with more than 2 absences this month.",
    description: "Payroll query with filter on absentDays.",
  },
  {
    question:
      "Which departments have employees with overtime hours greater than 10 this month?",
    description: "Department + Employee + Attendance/Payroll aggregation.",
  },
  {
    question: "Find all holidays in December 2024.",
    description: "Holiday model, date filter.",
  },
  {
    question:
      "Show me the net salary and total deduction for all employees in the Sales department for last month.",
    description:
      "Payroll + Employee + Department, with field selection and time filter.",
  },
];

// Function to make API call to chatbot
async function testChatbot(question) {
  try {
    const response = await fetch(`${BASE_URL}/chatbot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error testing chatbot:", error);
    return { error: error.message };
  }
}

// Function to test all questions in a category
async function testCategory(categoryName, questions) {
  console.log(`\n=== Testing ${categoryName} ===`);

  for (let i = 0; i < questions.length; i++) {
    const { question, description } = questions[i];
    console.log(`\n${i + 1}. ${description}`);
    console.log(`Question: ${question}`);

    const result = await testChatbot(question);

    // Log the full result for analysis
    console.log("Raw result:", JSON.stringify(result, null, 2));
    if (result.success && result.data && result.data.answer) {
      console.log(`Answer: ${result.data.answer.substring(0, 200)}...`);
    } else if (result.message || result.error) {
      console.log(`Error: ${result.message || result.error}`);
    } else if (result.results) {
      console.log(`Results: ${JSON.stringify(result.results, null, 2)}`);
    } else {
      console.log("No answer or error returned.");
    }

    // Add delay between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Function to run all tests
async function runAllTests() {
  console.log("Starting ChatBot Tests...\n");

  await testCategory("Employee Management", testExamples.employeeQuestions);
  await testCategory("Attendance Management", testExamples.attendanceQuestions);
  await testCategory("Payroll Management", testExamples.payrollQuestions);
  await testCategory("Department Management", testExamples.departmentQuestions);
  await testCategory("Holiday Management", testExamples.holidayQuestions);
  await testCategory("General System Questions", testExamples.generalQuestions);
  await testCategory(
    "Autonomous Project-Aware Queries",
    testExamples.autonomousQueryQuestions
  );

  console.log("\n=== All Tests Completed ===");
}

// Example usage functions
export const chatbotTestUtils = {
  // Test a single question
  testSingleQuestion: async (question) => {
    return await testChatbot(question);
  },

  // Test employee questions
  testEmployeeQuestions: async () => {
    return await testCategory(
      "Employee Management",
      testExamples.employeeQuestions
    );
  },

  // Test attendance questions
  testAttendanceQuestions: async () => {
    return await testCategory(
      "Attendance Management",
      testExamples.attendanceQuestions
    );
  },

  // Test payroll questions
  testPayrollQuestions: async () => {
    return await testCategory(
      "Payroll Management",
      testExamples.payrollQuestions
    );
  },

  // Test all questions
  testAllQuestions: async () => {
    return await runAllTests();
  },

  // Get all example questions
  getAllExamples: () => {
    return testExamples;
  },
};

// Example cURL commands for manual testing
export const curlExamples = {
  employee: `curl -X POST ${BASE_URL}/chatbot \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${AUTH_TOKEN}" \\
    -d '{"question": "How do I add a new employee?"}'`,

  attendance: `curl -X POST ${BASE_URL}/chatbot \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${AUTH_TOKEN}" \\
    -d '{"question": "How do I record daily attendance?"}'`,

  payroll: `curl -X POST ${BASE_URL}/chatbot \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${AUTH_TOKEN}" \\
    -d '{"question": "How is salary calculated?"}'`,

  department: `curl -X POST ${BASE_URL}/chatbot \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${AUTH_TOKEN}" \\
    -d '{"question": "How do I create a new department?"}'`,

  holiday: `curl -X POST ${BASE_URL}/chatbot \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${AUTH_TOKEN}" \\
    -d '{"question": "How do I add a new holiday?"}'`,
};

// Export for use in other files
export default {
  testExamples,
  testChatbot,
  testCategory,
  runAllTests,
  chatbotTestUtils,
  curlExamples,
};

// Run all tests if this script is executed directly
if (require.main === module) {
  runAllTests();
}
