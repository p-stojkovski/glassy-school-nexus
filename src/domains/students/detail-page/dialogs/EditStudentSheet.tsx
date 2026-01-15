import React, { useRef, useState, useCallback, useEffect } from 'react';
import { User } from 'lucide-react';
import { FormSheet } from '@/components/common/sheets';
import { TabbedStudentFormContent } from '@/domains/students/form-page';
import type { StudentFormRef } from '@/domains/students/form-page';
import { Student } from '@/domains/students/studentsSlice';
import { StudentFormData } from '@/types/api/student';

interface EditStudentSheetProps {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedStudent: Student) => void;
  onSubmit: (data: StudentFormData) => Promise<Student>;
}

/**
 * Sheet component for editing student data
 * Reuses the existing TabbedStudentFormContent for form logic and validation
 */
const EditStudentSheet: React.FC<EditStudentSheetProps> = ({
  student,
  open,
  onOpenChange,
  onSuccess,
  onSubmit,
}) => {
  const formRef = useRef<StudentFormRef>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when sheet opens
  useEffect(() => {
    if (open) {
      setHasUnsavedChanges(false);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleFormChange = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const handleSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    try {
      const updatedStudent = await onSubmit(data);
      setHasUnsavedChanges(false);
      onOpenChange(false);
      onSuccess(updatedStudent);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = useCallback(() => {
    // FormSheet handles unsaved changes warning via isDirty prop
    onOpenChange(false);
  }, [onOpenChange]);

  const handleConfirm = useCallback(() => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  }, []);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      intent="primary"
      size="lg"
      icon={User}
      title="Edit Student"
      description="Update student profile information including personal, guardian, and financial details."
      confirmText={isSubmitting ? 'Updating...' : 'Update Student'}
      cancelText="Cancel"
      onConfirm={handleConfirm}
      isLoading={isSubmitting}
      isDirty={hasUnsavedChanges}
    >
      <TabbedStudentFormContent
        ref={formRef}
        student={student}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onFormChange={handleFormChange}
        hideButtons={true}
      />
    </FormSheet>
  );
};

export default EditStudentSheet;
