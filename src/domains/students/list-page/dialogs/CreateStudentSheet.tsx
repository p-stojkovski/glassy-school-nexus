import React, { useRef, useState, useCallback, useEffect } from 'react';
import { User } from 'lucide-react';
import { FormSheet } from '@/components/common/sheets';
import { TabbedStudentFormContent } from '@/domains/students/form-page';
import type { StudentFormRef } from '@/domains/students/form-page';
import { StudentFormData } from '@/types/api/student';

interface CreateStudentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (studentId: string) => void;
  onSubmit: (data: StudentFormData) => Promise<{ id: string }>;
}

/**
 * Sheet component for creating a new student
 * Reuses the existing TabbedStudentFormContent for form logic and validation
 */
const CreateStudentSheet: React.FC<CreateStudentSheetProps> = ({
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
      const result = await onSubmit(data);
      setHasUnsavedChanges(false);
      onOpenChange(false);
      onSuccess(result.id);
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
      title="Add New Student"
      description="Create a new student profile with essential information. You can add more details like guardian and financial information."
      confirmText={isSubmitting ? 'Creating...' : 'Add Student'}
      cancelText="Cancel"
      onConfirm={handleConfirm}
      isLoading={isSubmitting}
      isDirty={hasUnsavedChanges}
    >
      <TabbedStudentFormContent
        ref={formRef}
        student={null}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onFormChange={handleFormChange}
        hideButtons={true}
      />
    </FormSheet>
  );
};

export default CreateStudentSheet;
