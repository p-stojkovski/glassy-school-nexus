import React from 'react';
import TabbedStudentFormContent, { StudentFormRef } from './TabbedStudentFormContent';
import { Student } from '@/domains/students/studentsSlice';
import { StudentFormData } from '@/types/api/student';

// Re-export the StudentFormData type from TabbedStudentFormContent
export type { StudentFormData } from './TabbedStudentFormContent';
export type { StudentFormRef } from './TabbedStudentFormContent';

interface StudentFormContentProps {
  student?: Student | null;
  onSubmit: (data: StudentFormData) => void;
  onCancel: () => void;
  onFormChange?: (data: StudentFormData) => void;
}

/**
 * StudentFormContent - Enhanced wrapper component for student form
 * 
 * This component now uses the new TabbedStudentFormContent to provide
 * a modern tabbed interface while maintaining backward compatibility.
 */
const StudentFormContent = React.forwardRef<StudentFormRef, StudentFormContentProps>(
  (props, ref) => {
    return <TabbedStudentFormContent {...props} ref={ref} />;
  }
);

export default StudentFormContent;

