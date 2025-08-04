# API Endpoints Specification

## Overview

This document defines the REST API endpoints for the backend integration, following vertical slice architecture principles and the Result<T> pattern as specified in the API rules.md.

## API Standards

### Base URL
- Development: `https://localhost:7001/api/v1`
- Production: `https://api.glassy-school-nexus.com/api/v1`

### Common Patterns

#### Request/Response Format
- **Content-Type**: `application/json`
- **Accept**: `application/json`
- **Character Encoding**: UTF-8

#### Authentication
- **Method**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <token>`
- **Roles**: `admin`, `teacher`, `student`

#### Error Responses
All error responses follow RFC 9457 Problem Details format:

```json
{
  "type": "https://api.glassy-school-nexus.com/problems/validation-failed",
  "title": "Validation Failed",
  "status": 400,
  "detail": "One or more validation errors occurred",
  "instance": "/api/v1/students",
  "errorCode": "validation_failed",
  "traceId": "80000001-0001-ff00-b63f-84710c7967bb",
  "errors": {
    "name": ["Name is required"],
    "email": ["Email must be valid"]
  }
}
```

#### Pagination
Standard pagination for list endpoints:
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalCount": 95,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## Authentication Endpoints

### POST /auth/login
**Purpose**: Authenticate user and return JWT token

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-01-15T10:30:00Z",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
  }
}
```

### POST /auth/refresh
**Purpose**: Refresh JWT token

**Request**:
```json
{
  "refreshToken": "refresh_token_here"
}
```

### POST /auth/logout
**Purpose**: Invalidate current token

## Student Management Endpoints

### GET /students
**Purpose**: Get paginated list of students with filtering

**Query Parameters**:
- `page` (int, default: 1)
- `pageSize` (int, default: 20, max: 100)
- `search` (string): Search by name or email
- `classId` (UUID): Filter by class
- `status` (string): Filter by status (active, inactive)
- `hasDiscount` (boolean): Filter by discount status

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Emma Johnson",
      "email": "emma.johnson@email.com",
      "phone": "+1-555-0101",
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      "status": "active",
      "className": "English Basics A1",
      "hasDiscount": true,
      "discountType": "relatives",
      "paymentDue": false,
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": { /* pagination object */ }
}
```

### GET /students/{id}
**Purpose**: Get detailed student information

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Emma Johnson",
  "email": "emma.johnson@email.com",
  "phone": "+1-555-0101",
  "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
  "status": "active",
  "joinDate": "2024-01-15",
  "dateOfBirth": "2005-03-12",
  "placeOfBirth": "Springfield, IL",
  "address": "123 Oak Street, Springfield, IL 62701",
  "classId": "550e8400-e29b-41d4-a716-446655440010",
  "className": "English Basics A1",
  "parentInfo": {
    "name": "Sarah Johnson",
    "email": "sarah.johnson@email.com",
    "phone": "+1-555-0201"
  },
  "emergencyContact": {
    "name": "Michael Johnson",
    "relationship": "Father",
    "phone": "+1-555-0301"
  },
  "academicInfo": {
    "level": "Intermediate",
    "gpa": 3.8,
    "enrollmentDate": "2024-01-15"
  },
  "discountInfo": {
    "hasDiscount": true,
    "type": "relatives",
    "amount": 500.00
  },
  "createdAt": "2024-01-15T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z"
}
```

### POST /students
**Purpose**: Create new student

**Request**:
```json
{
  "name": "New Student",
  "email": "new.student@email.com",
  "phone": "+1-555-0199",
  "dateOfBirth": "2005-06-15",
  "placeOfBirth": "Chicago, IL",
  "address": "456 Main St, Chicago, IL 60601",
  "classId": "550e8400-e29b-41d4-a716-446655440010",
  "parentInfo": {
    "name": "Parent Name",
    "email": "parent@email.com",
    "phone": "+1-555-0299"
  },
  "emergencyContact": {
    "name": "Emergency Contact",
    "relationship": "Uncle",
    "phone": "+1-555-0399"
  },
  "academicInfo": {
    "level": "Beginner",
    "enrollmentDate": "2024-02-01"
  },
  "discountInfo": {
    "hasDiscount": false
  }
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440099",
  /* ... full student object */
}
```

### PUT /students/{id}
**Purpose**: Update existing student

### DELETE /students/{id}
**Purpose**: Soft delete student (set status to inactive)

## Class Management Endpoints

### GET /classes
**Purpose**: Get paginated list of classes

**Query Parameters**:
- `page`, `pageSize` (pagination)
- `teacherId` (UUID): Filter by teacher
- `status` (string): Filter by status
- `level` (string): Filter by level

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "English Basics A1",
      "level": "Beginner",
      "status": "active",
      "teacher": {
        "id": "550e8400-e29b-41d4-a716-446655440020",
        "name": "Sarah Johnson",
        "subject": "English"
      },
      "classroom": {
        "id": "550e8400-e29b-41d4-a716-446655440030",
        "name": "Room A-101",
        "capacity": 25
      },
      "enrollment": {
        "current": 15,
        "maximum": 20,
        "available": 5
      },
      "schedule": [
        {
          "dayOfWeek": 1,
          "dayName": "Monday",
          "startTime": "09:00",
          "endTime": "10:30"
        }
      ]
    }
  ],
  "pagination": { /* pagination object */ }
}
```

### GET /classes/{id}
**Purpose**: Get detailed class information including enrolled students

### POST /classes
**Purpose**: Create new class

**Request**:
```json
{
  "name": "Advanced English C1",
  "description": "Advanced English conversation and grammar",
  "level": "Advanced",
  "teacherId": "550e8400-e29b-41d4-a716-446655440020",
  "classroomId": "550e8400-e29b-41d4-a716-446655440030",
  "maxStudents": 15,
  "schedule": [
    {
      "dayOfWeek": 2,
      "startTime": "14:00",
      "endTime": "15:30"
    },
    {
      "dayOfWeek": 4,
      "startTime": "14:00",
      "endTime": "15:30"
    }
  ]
}
```

### PUT /classes/{id}
**Purpose**: Update class information

### DELETE /classes/{id}
**Purpose**: Soft delete class

### POST /classes/{id}/enroll
**Purpose**: Enroll student in class

**Request**:
```json
{
  "studentId": "550e8400-e29b-41d4-a716-446655440001"
}
```

### DELETE /classes/{id}/students/{studentId}
**Purpose**: Remove student from class

## Teacher Management Endpoints

### GET /teachers
**Purpose**: Get paginated list of teachers

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "name": "Sarah Johnson",
      "email": "sarah.johnson@school.com",
      "phone": "+1-555-1001",
      "subject": "English",
      "joinDate": "2023-08-15",
      "classCount": 3,
      "isActive": true
    }
  ],
  "pagination": { /* pagination object */ }
}
```

### GET /teachers/{id}
**Purpose**: Get detailed teacher information including assigned classes

### POST /teachers
**Purpose**: Create new teacher

### PUT /teachers/{id}
**Purpose**: Update teacher information

### DELETE /teachers/{id}
**Purpose**: Soft delete teacher

## Classroom Management Endpoints

### GET /classrooms
**Purpose**: Get list of classrooms

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "name": "Room A-101",
      "location": "Building A, First Floor",
      "capacity": 25,
      "isActive": true,
      "currentUsage": {
        "scheduledHours": 20,
        "availableHours": 20
      }
    }
  ]
}
```

### GET /classrooms/{id}
### POST /classrooms
### PUT /classrooms/{id}
### DELETE /classrooms/{id}

## Financial Management Endpoints

### GET /payment-obligations
**Purpose**: Get paginated list of payment obligations

**Query Parameters**:
- `studentId` (UUID): Filter by student
- `status` (string): Filter by status
- `dueDate` (date range): Filter by due date
- `type` (string): Filter by obligation type

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440040",
      "studentId": "550e8400-e29b-41d4-a716-446655440001",
      "studentName": "Emma Johnson",
      "type": "Tuition Fee",
      "amount": 850.00,
      "dueDate": "2024-01-31",
      "period": "Spring 2024",
      "status": "paid",
      "totalPaid": 850.00,
      "balance": 0.00,
      "notes": "Payment for Spring semester tuition"
    }
  ],
  "pagination": { /* pagination object */ }
}
```

### GET /payment-obligations/{id}
**Purpose**: Get detailed payment obligation with payment history

### POST /payment-obligations
**Purpose**: Create new payment obligation

**Request**:
```json
{
  "studentId": "550e8400-e29b-41d4-a716-446655440001",
  "type": "Tuition Fee",
  "amount": 1200.00,
  "dueDate": "2024-03-31",
  "period": "Spring 2024",
  "notes": "Spring semester tuition"
}
```

### PUT /payment-obligations/{id}
### DELETE /payment-obligations/{id}

### GET /payment-obligations/{id}/payments
**Purpose**: Get payments for specific obligation

### POST /payment-obligations/{id}/payments
**Purpose**: Record payment against obligation

**Request**:
```json
{
  "amount": 600.00,
  "paymentDate": "2024-02-15",
  "method": "card",
  "notes": "Partial payment - credit card"
}
```

### Bulk Operations

### POST /payment-obligations/bulk
**Purpose**: Create multiple payment obligations

**Request**:
```json
{
  "obligations": [
    {
      "studentId": "550e8400-e29b-41d4-a716-446655440001",
      "type": "Tuition Fee",
      "amount": 1200.00,
      "dueDate": "2024-03-31",
      "period": "Spring 2024"
    }
    // ... more obligations
  ]
}
```

### POST /payments/bulk
**Purpose**: Record multiple payments

## Attendance Management Endpoints

### GET /attendance
**Purpose**: Get attendance records with filtering

**Query Parameters**:
- `classId` (UUID): Filter by class
- `studentId` (UUID): Filter by student
- `date` (date range): Filter by date range
- `status` (string): Filter by attendance status

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440050",
      "studentId": "550e8400-e29b-41d4-a716-446655440001",
      "studentName": "Emma Johnson",
      "classId": "550e8400-e29b-41d4-a716-446655440010",
      "className": "English Basics A1",
      "date": "2024-01-15",
      "status": "present",
      "homeworkCompleted": true,
      "notes": null
    }
  ],
  "pagination": { /* pagination object */ }
}
```

### POST /attendance
**Purpose**: Record attendance for a class session

**Request**:
```json
{
  "classId": "550e8400-e29b-41d4-a716-446655440010",
  "date": "2024-01-15",
  "records": [
    {
      "studentId": "550e8400-e29b-41d4-a716-446655440001",
      "status": "present",
      "homeworkCompleted": true
    },
    {
      "studentId": "550e8400-e29b-41d4-a716-446655440002",
      "status": "absent",
      "homeworkCompleted": false,
      "notes": "Sick"
    }
  ]
}
```

### PUT /attendance/{id}
**Purpose**: Update individual attendance record

### GET /attendance/summary
**Purpose**: Get attendance summary statistics

**Query Parameters**:
- `classId`, `studentId`, `dateRange`

**Response** (200 OK):
```json
{
  "totalSessions": 20,
  "presentCount": 18,
  "absentCount": 1,
  "lateCount": 1,
  "excusedCount": 0,
  "attendanceRate": 0.90,
  "homeworkCompletionRate": 0.85
}
```

## Grades & Assessment Endpoints

### GET /assessments
**Purpose**: Get assessments with filtering

**Query Parameters**:
- `classId` (UUID): Filter by class
- `type` (string): Filter by assessment type
- `dateRange`: Filter by date range

### POST /assessments
**Purpose**: Create new assessment

**Request**:
```json
{
  "classId": "550e8400-e29b-41d4-a716-446655440010",
  "title": "Unit 1 Test",
  "type": "test",
  "totalPoints": 100,
  "date": "2024-02-15",
  "description": "Test covering basic grammar and vocabulary"
}
```

### GET /assessments/{id}/grades
**Purpose**: Get all grades for an assessment

### POST /assessments/{id}/grades
**Purpose**: Record grades for an assessment

**Request**:
```json
{
  "grades": [
    {
      "studentId": "550e8400-e29b-41d4-a716-446655440001",
      "value": "95",
      "comments": "Excellent work"
    },
    {
      "studentId": "550e8400-e29b-41d4-a716-446655440002",
      "value": "B+",
      "comments": "Good understanding, minor errors"
    }
  ]
}
```

### GET /students/{id}/grades
**Purpose**: Get all grades for a specific student

## Private Lessons Endpoints

### GET /private-lessons
**Purpose**: Get private lessons with filtering

**Query Parameters**:
- `studentId`, `teacherId`, `date`, `status`

### POST /private-lessons
**Purpose**: Schedule new private lesson

**Request**:
```json
{
  "studentId": "550e8400-e29b-41d4-a716-446655440001",
  "teacherId": "550e8400-e29b-41d4-a716-446655440020",
  "classroomId": "550e8400-e29b-41d4-a716-446655440030",
  "subject": "English Conversation",
  "lessonDate": "2024-02-20",
  "startTime": "15:00",
  "endTime": "16:00",
  "notes": "Focus on pronunciation",
  "paymentObligation": {
    "amount": 50.00,
    "dueDate": "2024-02-20"
  }
}
```

### PUT /private-lessons/{id}/status
**Purpose**: Update lesson status (complete, cancel)

**Request**:
```json
{
  "status": "completed",
  "notes": "Great progress on conversation skills"
}
```

### POST /private-lessons/{id}/payments
**Purpose**: Record payment for private lesson

## Reporting Endpoints

### GET /reports/financial-summary
**Purpose**: Get financial overview

### GET /reports/attendance-summary
**Purpose**: Get attendance statistics

### GET /reports/class-performance
**Purpose**: Get class performance metrics

### GET /reports/student-progress
**Purpose**: Get individual student progress report

## Data Management Endpoints

### POST /data/export
**Purpose**: Export data for backup

**Response** (200 OK):
```json
{
  "exportId": "550e8400-e29b-41d4-a716-446655440999",
  "downloadUrl": "https://api.glassy-school-nexus.com/exports/550e8400-e29b-41d4-a716-446655440999",
  "expiresAt": "2024-01-16T10:30:00Z"
}
```

### POST /data/import
**Purpose**: Import data from backup

### POST /data/reset-demo
**Purpose**: Reset to demo data (development only)

---

## Implementation Notes

### Vertical Slice Organization
Each endpoint group should be implemented as a separate vertical slice following the API rules:
- `Features/GetStudents/` - Contains endpoint, query, response models
- `Features/CreateStudent/` - Contains endpoint, command, request models
- etc.

### Result<T> Pattern
All business logic returns `Result<T>` which endpoints map to HTTP responses:
- `Success` → 200 OK, 201 Created, 204 No Content
- `Validation failure` → 400 Bad Request
- `Not found` → 404 Not Found
- `Conflict` → 409 Conflict
- `Unauthorized` → 401 Unauthorized

### Performance Considerations
- Implement pagination for all list endpoints
- Use database projections for list views
- Cache static data (classrooms, teachers)
- Implement rate limiting

### Security
- All endpoints require authentication except health checks
- Role-based authorization for sensitive operations
- Input validation using FluentValidation
- SQL injection prevention through parameterized queries

*This specification provides the complete API contract for frontend integration while following the established architectural patterns.*