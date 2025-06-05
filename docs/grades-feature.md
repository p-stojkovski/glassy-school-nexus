# Grades and Assessments Feature Documentation

## Overview
The Grades and Assessments feature in the glassy-school-nexus application provides teachers with tools to create assessments, enter student grades, and view the gradebook.

## Features
- **Create Assessment**: Allows teachers to create various types of assessments like tests, quizzes, etc.
- **Enter Grades**: Enter grades for students for specific assessments
- **Gradebook View**: View all grades in a tabular format with filtering and search
- **Export to CSV**: Export gradebook data to a CSV file

## Technical Implementation

### Data Models
- **Assessment**:
  - id: unique identifier
  - classId: the class for which the assessment is created
  - title: assessment title
  - type: type of assessment (Homework, Test, Quiz, etc.)
  - totalPoints: maximum points (optional, for numeric grading)
  - date: date of the assessment
  - description: additional details (optional)

- **Grade**:
  - id: unique identifier
  - assessmentId: the assessment being graded
  - studentId: the student being graded
  - value: grade value (can be numeric or letter)
  - comments: additional feedback (optional)
  - dateRecorded: when the grade was recorded

### Components
- **GradesManagement**: Main page component with tab navigation
- **GradesHeader**: Navigation tabs for the different functionality
- **GradesFilters**: Filter for selecting classes
- **CreateAssessment**: Form for creating new assessments
- **GradeEntry**: Interface for entering student grades
- **Gradebook**: Table view of all student grades
- **DemoModeNotification**: Notice informing users that data is stored locally

### Data Flow
1. Teachers select a class
2. They can create assessments for that class
3. They can enter grades for students in a specific assessment
4. They can view the gradebook to see all grades across assessments
5. They can export the gradebook to a CSV file

### Technical Notes
- All data is stored in the Redux store
- Data persistence is achieved with localStorage
- The feature is designed with a responsive user interface
- Grade validation ensures proper format (numeric or letter grades)

## Demo Mode
This implementation is frontend-only, with all data stored in the browser's localStorage. In a production environment, this would be connected to a backend API.

## Future Enhancements
- Statistical analysis of grades
- Grade weighting and GPA calculation
- Custom grading scales
- Parent/student view for grades
