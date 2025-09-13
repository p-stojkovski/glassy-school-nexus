import React from 'react';
import StudentFormContent from './StudentFormContent';
import { Student } from '@/domains/students/studentsSlice';

// Re-export the StudentFormData type from StudentFormContent
export type { StudentFormData } from './StudentFormContent';

interface StudentFormProps {
  student?: Student | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onFormChange?: () => void;
}

/**
 * StudentForm - Legacy wrapper component for backward compatibility
 * 
 * This component now wraps StudentFormContent to maintain backward compatibility
 * while allowing new components to use the improved StudentFormContent directly.
 */
const StudentForm: React.FC<StudentFormProps> = (props) => {
  return <StudentFormContent {...props} />;
};

export default StudentForm;

