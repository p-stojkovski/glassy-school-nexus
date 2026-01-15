import React, { useRef, useState, useCallback, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { FormSheet } from '@/components/common/sheets';
import TabbedTeacherFormContent from '../../form-page/forms/TabbedTeacherFormContent';
import type { TeacherFormRef } from '../../form-page/forms/TabbedTeacherFormContent';
import { TeacherFormData, SubjectDto } from '@/types/api/teacher';
import { teacherApiService } from '@/services/teacherApiService';

interface CreateTeacherSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (teacherId: string) => void;
  onSubmit: (data: TeacherFormData) => Promise<{ id: string }>;
}

/**
 * Sheet component for creating a new teacher
 * Reuses TabbedTeacherFormContent for form logic and validation
 */
const CreateTeacherSheet: React.FC<CreateTeacherSheetProps> = ({
  open,
  onOpenChange,
  onSuccess,
  onSubmit,
}) => {
  const formRef = useRef<TeacherFormRef>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // Load subjects when sheet opens
  useEffect(() => {
    if (open) {
      const loadSubjects = async () => {
        setSubjectsLoading(true);
        try {
          const s = await teacherApiService.getAllSubjects();
          setSubjects(s);
        } catch (err) {
          console.error('Failed to load subjects:', err);
        } finally {
          setSubjectsLoading(false);
        }
      };
      loadSubjects();
    }
  }, [open]);

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

  const handleSubmit = async (data: TeacherFormData) => {
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

  const handleConfirm = useCallback(() => {
    formRef.current?.submitForm();
  }, []);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      intent="primary"
      size="lg"
      icon={UserPlus}
      title="Add New Teacher"
      description="Create a new teacher profile with essential information. You can add personal details and professional notes."
      confirmText={isSubmitting ? 'Creating...' : 'Add Teacher'}
      cancelText="Cancel"
      onConfirm={handleConfirm}
      isLoading={isSubmitting}
      isDirty={hasUnsavedChanges}
    >
      {subjectsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      ) : (
        <TabbedTeacherFormContent
          ref={formRef}
          teacher={null}
          subjects={subjects}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          onFormChange={handleFormChange}
          hideButtons={true}
        />
      )}
    </FormSheet>
  );
};

export default CreateTeacherSheet;
