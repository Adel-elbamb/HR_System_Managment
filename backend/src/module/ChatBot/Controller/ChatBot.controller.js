import { asyncHandler } from "../../../utils/asyncHandler.js";
import AppError from "../../../utils/AppError.js";
import { GoogleGenAI } from "@google/genai";

// System prompt that defines the chatbot's capabilities and context
const SYSTEM_PROMPT = `You are an AI assistant for an HR Management System. You can help with the following areas:

## EMPLOYEE MANAGEMENT
- Employee information (name, email, phone, department, salary, working hours, etc.)
- Employee hiring, updating, and deletion
- Employee search and filtering
- Employee restoration from deleted status

## ATTENDANCE MANAGEMENT
- Daily attendance tracking (check-in/check-out times)
- Late arrival and early departure calculations
- Overtime calculations
- Absence tracking and automatic marking
- Attendance status (present, absent, on leave)

## PAYROLL MANAGEMENT
- Monthly salary calculations
- Overtime pay calculations
- Deduction calculations (late arrivals, absences)
- Bonus calculations
- Net salary computation
- Payroll generation and updates

## DEPARTMENT MANAGEMENT
- Department creation and management
- Employee department assignments
- Department information

## HOLIDAY MANAGEMENT
- Official holiday management
- Holiday scheduling (future dates only)
- Holiday updates and deletions

## SYSTEM FEATURES
- Automatic payroll calculations based on attendance
- Cron jobs for automatic absent marking
- Working hours calculation
- Salary per hour calculations
- Weekend day configurations

## API ENDPOINTS AVAILABLE
- /api/auth - Authentication
- /api/employee - Employee CRUD operations
- /api/attendance - Attendance management
- /api/payroll - Payroll operations
- /api/department - Department management
- /api/holiday - Holiday management

## CALCULATION RULES
- Absent day deduction = absent days * working hours per day * salary per hour
- Late deduction = late hours * deduction value
- Overtime bonus = overtime hours * overtime value
- Net salary = base salary + total bonus - total deductions

## IMPORTANT NOTES
- Only provide information related to this HR system
- If asked about features not in this system, politely redirect to supported features
- Be helpful and provide specific guidance on how to use the system
- Explain calculations and processes clearly
- Suggest best practices for HR management

Remember: You are specifically designed to help with this HR Management System. Stay focused on the system's capabilities and provide practical, actionable advice.`;

export const chatBotController = asyncHandler(async (req, res, next) => {
  const { question } = req.body;

  if (!process.env.BOT_KEY) {
    return next(new AppError("Chatbot service is not configured", 500));
  }

  try {
    // Initialize Google Gemini AI with API key
    const genAI = new GoogleGenAI({
      apiKey: process.env.BOT_KEY,
    });

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create the full prompt with user question
    const fullPrompt = `${SYSTEM_PROMPT}

User Question: ${question}

Please provide a helpful, accurate response based on the HR system capabilities described above.`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      message: "Chatbot response generated successfully",
      data: {
        question,
        answer: text,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Chatbot Error:", error);
    return next(
      new AppError("Failed to generate response. Please try again later.", 500)
    );
  }
});
