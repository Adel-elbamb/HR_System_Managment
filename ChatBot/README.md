# HR Management System ChatBot

## Overview

The HR Management System ChatBot is an AI-powered assistant that helps HR users navigate and understand the system's capabilities. It uses Google Gemini AI to provide intelligent responses to HR-related queries.

## Features

### 🤖 AI-Powered Assistance

- **Intelligent Responses**: Uses Google Gemini AI for natural language understanding
- **Context-Aware**: Understands the specific HR system context and capabilities
- **Real-time Help**: Provides instant answers to HR-related questions

### 📋 System Knowledge

The chatbot is trained on all aspects of the HR Management System:

#### Employee Management

- Employee information management
- Hiring and onboarding processes
- Employee updates and deletion
- Department assignments
- Salary and working hours configuration

#### Attendance Management

- Daily attendance tracking
- Late arrival and overtime calculations
- Automatic absent marking
- Attendance status management

#### Payroll Management

- Monthly salary calculations
- Deduction and bonus calculations
- Net salary computation
- Automatic payroll generation

#### Department Management

- Department creation and management
- Employee department assignments

#### Holiday Management

- Official holiday scheduling
- Holiday management and updates

## Setup

### 1. Install Dependencies

```bash
npm install @google/generative-ai
```

### 2. Environment Configuration

Add your Google Gemini API key to your `.env` file:

```env
BOT_KEY=your_google_gemini_api_key_here
```

### 3. API Endpoint

The chatbot is available at:

```
POST /api/chatbot
```

## Usage

### API Request

```javascript
POST /api/chatbot
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "question": "How do I add a new employee?"
}
```

### API Response

```javascript
{
  "success": true,
  "message": "Chatbot response generated successfully",
  "data": {
    "question": "How do I add a new employee?",
    "answer": "To add a new employee to the HR system...",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Example Questions

### Employee Management

- "How do I add a new employee?"
- "What information is required when creating an employee?"
- "How do I update employee salary?"
- "How do I assign an employee to a department?"

### Attendance Management

- "How do I record daily attendance?"
- "How is late arrival calculated?"
- "What happens if an employee doesn't check in?"
- "How do I calculate overtime?"

### Payroll Management

- "How is salary calculated?"
- "What deductions are applied?"
- "How are bonuses calculated?"
- "What is the net salary formula?"

### Department Management

- "How do I create a new department?"
- "How do I assign employees to departments?"

### Holiday Management

- "How do I add a new holiday?"
- "Can I set holidays for past dates?"

## System Calculations

The chatbot understands and can explain:

### Salary Calculations

- **Absent Deduction**: `absent days × working hours per day × salary per hour`
- **Late Deduction**: `late hours × deduction value`
- **Overtime Bonus**: `overtime hours × overtime value`
- **Net Salary**: `base salary + total bonus - total deductions`

### Attendance Calculations

- **Late Arrival**: Check-in time > default check-in time
- **Overtime**: Check-out time > default check-out time
- **Working Hours**: default check-out time - default check-in time

## Error Handling

The chatbot includes comprehensive error handling:

- **Missing API Key**: Returns error if BOT_KEY is not configured
- **Invalid Questions**: Validates question format and length
- **AI Service Errors**: Handles Google Gemini API errors gracefully
- **Rate Limiting**: Respects API usage limits

## Security

- **Authentication Required**: All chatbot requests require valid JWT token
- **Input Validation**: Questions are validated for length and format
- **Error Sanitization**: Sensitive information is not exposed in error messages

## Best Practices

### For HR Users

1. **Be Specific**: Ask specific questions for better responses
2. **Use Keywords**: Include relevant terms like "employee", "attendance", "payroll"
3. **Follow Up**: Ask follow-up questions for detailed explanations
4. **Verify Information**: Always verify critical information through the main system

### For Developers

1. **Monitor Usage**: Track API usage and response quality
2. **Update Knowledge**: Keep system information current
3. **Test Responses**: Regularly test chatbot responses for accuracy
4. **Handle Edge Cases**: Ensure proper error handling for unusual requests

## Troubleshooting

### Common Issues

1. **"Chatbot service is not configured"**

   - Ensure BOT_KEY is set in your .env file
   - Verify the API key is valid and active

2. **"Failed to generate response"**

   - Check Google Gemini API status
   - Verify network connectivity
   - Check API usage limits

3. **Poor Response Quality**
   - Rephrase your question more specifically
   - Include relevant context and keywords
   - Ask follow-up questions for clarification

## Support

For technical support or questions about the chatbot:

1. Check the system logs for detailed error information
2. Verify your Google Gemini API key is valid
3. Ensure all dependencies are properly installed
4. Contact the development team for assistance

## Version History

- **v1.0.0**: Initial release with basic HR system knowledge
- Comprehensive system understanding
- Google Gemini AI integration
- Full API documentation
