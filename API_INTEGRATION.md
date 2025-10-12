# API Integration Guide

This document explains how to integrate the TakeSpace Editor with your backend API.

## Current Status

The frontend is **ready for API integration**. Currently using a mock API that logs all data to the browser console.

## API Endpoint Required

You need to create a POST endpoint to receive question submissions.

**Suggested endpoint:** `POST /api/questions` or `POST /api/v1/questions/create`

## Request Format

The frontend sends data as **multipart/form-data** (for file uploads).

### FormData Fields

#### Curriculum Information
- `syllabus` (string) - e.g., "IB", "IGCSE", "Common Core"
- `grade` (string) - e.g., "Grade 11", "Grade 10"
- `subject` (string) - e.g., "Mathematics", "Physics", "Chemistry"
- `unit` (string) - e.g., "Algebra", "Mechanics", "Stoichiometry"
- `topic` (string) - e.g., "Linear Equations", "Forces", "Mole Concept"

#### Question Details
- `title` (string) - Question title
- `content` (string) - Question description/content
- `timestamp` (string) - ISO 8601 timestamp
- `hasQuestionCanvas` (string) - "true" or "false"

#### Question Canvas
- `questionCanvas` (File/Blob) - PNG image of the question canvas
  - Only included if `hasQuestionCanvas` is "true"
  - Filename format: `question_canvas_[timestamp].png`

#### Answer Data
- `answers[0]` through `answers[3]` (JSON strings) - Answer metadata
  - Each contains: `{ id, text, type, isCorrect, position }`
  - `type` can be: "text" or "canvas"
  - `isCorrect` is boolean (only one should be true)

#### Answer Canvases
- `answerCanvas_0` through `answerCanvas_3` (File/Blob) - PNG images
  - Only included for answers with type="canvas" that have content
  - Filename format: `answer_[position]_[correct|wrong]_[timestamp].png`

#### Metadata
- `totalShapes` (string) - Number of shapes in question canvas
- `totalAnswers` (string) - Number of answers (always "4")
- `correctAnswerIndex` (string) - Index of correct answer (0-3)

## Example FormData Structure

```
FormData {
  syllabus: "IB"
  grade: "Grade 11"
  subject: "Mathematics"
  unit: "Algebra"
  topic: "Linear Equations"
  title: "Solve the equation"
  content: "Find the value of x"
  timestamp: "2025-10-08T12:34:56.789Z"
  hasQuestionCanvas: "true"
  questionCanvas: [Blob 45632 bytes, type: image/png]
  answers[0]: '{"id":"1","text":"x = 5","type":"text","isCorrect":true,"position":0}'
  answers[1]: '{"id":"2","text":"x = 3","type":"text","isCorrect":false,"position":1}'
  answers[2]: '{"id":"3","text":"","type":"canvas","isCorrect":false,"position":2}'
  answers[3]: '{"id":"4","text":"x = 7","type":"text","isCorrect":false,"position":3}'
  answerCanvas_2: [Blob 23456 bytes, type: image/png]
  totalShapes: "5"
  totalAnswers: "4"
  correctAnswerIndex: "0"
}
```

## Backend Response Expected

The API should return a JSON response:

### Success Response (200 OK)
```json
{
  "success": true,
  "questionId": "unique-question-id",
  "message": "Question saved successfully"
}
```

### Error Response (4xx or 5xx)
```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

## Frontend Integration Steps

1. Open `src/app/page.tsx`
2. Find the `sendQuestionToAPI` function (around line 469)
3. Replace the mock implementation with real API call
4. Uncomment and modify the provided fetch example:

```typescript
const sendQuestionToAPI = async (formData: FormData): Promise<any> => {
  const response = await fetch('https://your-api.com/api/questions', {
    method: 'POST',
    body: formData,
    headers: {
      // Add auth headers if needed
      'Authorization': `Bearer ${yourAuthToken}`,
    },
    // Don't set Content-Type - browser sets it automatically with boundary
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
};
```

## Backend Implementation Tips

### Node.js (Express + Multer)
```javascript
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/questions', 
  upload.fields([
    { name: 'questionCanvas', maxCount: 1 },
    { name: 'answerCanvas_0', maxCount: 1 },
    { name: 'answerCanvas_1', maxCount: 1 },
    { name: 'answerCanvas_2', maxCount: 1 },
    { name: 'answerCanvas_3', maxCount: 1 }
  ]),
  async (req, res) => {
    const { syllabus, grade, subject, unit, topic, title, content } = req.body;
    const files = req.files;
    
    // Parse answer JSON strings
    const answers = [
      JSON.parse(req.body['answers[0]']),
      JSON.parse(req.body['answers[1]']),
      JSON.parse(req.body['answers[2]']),
      JSON.parse(req.body['answers[3]'])
    ];
    
    // Save to database and file storage
    // ...
    
    res.json({
      success: true,
      questionId: savedQuestion.id,
      message: 'Question saved successfully'
    });
  }
);
```

### Python (FastAPI)
```python
from fastapi import FastAPI, File, UploadFile, Form
from typing import Optional

@app.post("/api/questions")
async def create_question(
    syllabus: str = Form(...),
    grade: str = Form(...),
    subject: str = Form(...),
    unit: str = Form(...),
    topic: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    questionCanvas: Optional[UploadFile] = File(None),
    answerCanvas_0: Optional[UploadFile] = File(None),
    # ... other answer canvases
):
    # Process the question
    # Save files to storage
    # Save metadata to database
    
    return {
        "success": True,
        "questionId": question_id,
        "message": "Question saved successfully"
    }
```

## Validation Requirements

The frontend validates:
- ✅ Question title is not empty
- ✅ All curriculum fields are selected
- ✅ At least one answer is marked as correct

Backend should additionally validate:
- File size limits (suggested: 5MB per image)
- Image format is PNG
- Required fields are present
- Data types and formats
- User authentication/authorization

## Testing the Mock API

1. Run the development server: `npm run dev`
2. Fill out all form fields
3. Click "Submit to Server"
4. Open browser console (F12)
5. Look for "=== MOCK API CALL ===" logs showing all FormData

## Questions?

Contact the frontend team if you need clarification on any data format or field.

