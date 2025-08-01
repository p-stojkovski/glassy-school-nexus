import React from 'react';
import TabbedStudentFormContent from './TabbedStudentFormContent';
import { Student } from '@/domains/students/studentsSlice';

// Re-export the StudentFormData type from TabbedStudentFormContent
export type { StudentFormData } from './TabbedStudentFormContent';

interface StudentFormContentProps {
  student?: Student | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onFormChange?: () => void;
}

/**
 * StudentFormContent - Enhanced wrapper component for student form
 * 
 * This component now uses the new TabbedStudentFormContent to provide
 * a modern tabbed interface while maintaining backward compatibility.
 */
const StudentFormContent: React.FC<StudentFormContentProps> = (props) => {
  return <TabbedStudentFormContent {...props} />;
};

export default StudentFormContent;