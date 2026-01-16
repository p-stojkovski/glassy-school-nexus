import React, { useRef, useState, useCallback, useEffect } from 'react';
import { UserCog } from 'lucide-react';
import { FormSheet } from '@/components/common/sheets';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateTeacher as updateTeacherInStore, selectSubjects } from '@/domains/teachers/teachersSlice';
import { updateTeacher, getAllSubjects } from '@/services/teacherApiService';
import { showSuccessMessage, TeacherErrorHandlers } from '@/utils/apiErrorHandler';
import { validateAndPrepareTeacherData } from '@/utils/validation/teacherValidators';
import { UpdateTeacherRequest, SubjectDto } from '@/types/api/teacher';
import { TeacherFormData } from '@/types/api/teacher';
import { clearCache } from '@/utils/cacheManager';
import TabbedTeacherFormContent from '../../form-page/forms/TabbedTeacherFormContent';
import type { TeacherFormRef } from '../../form-page/forms/TabbedTeacherFormContent';
import type { Teacher } from '../../teachersSlice';

interface EditTeacherSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacher: Teacher;
}

/**
 * Sheet component for editing an existing teacher
 * Uses TabbedTeacherFormContent for tabbed form layout with validation
 */
const EditTeacherSheet: React.FC<EditTeacherSheetProps> = ({
  isOpen,
  onClose,
  onSuccess,
  teacher,
}) => {
  const dispatch = useAppDispatch();
  const formRef = useRef<TeacherFormRef>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // Get subjects from store or fetch them
  const storeSubjects = useAppSelector(selectSubjects);

  // Load subjects if not in store
  useEffect(() => {
    const loadSubjects = async () => {
      if (storeSubjects.length > 0) {
        setSubjects(storeSubjects);
        return;
      }

      setSubjectsLoading(true);
      try {
        const fetchedSubjects = await getAllSubjects();
        setSubjects(fetchedSubjects);
      } catch (error) {
        console.error('Failed to load subjects:', error);
      } finally {
        setSubjectsLoading(false);
      }
    };

    if (isOpen) {
      loadSubjects();
    }
  }, [isOpen, storeSubjects]);

  // Reset state when sheet opens
  useEffect(() => {
    if (isOpen) {
      setHasUnsavedChanges(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleFormChange = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const handleSubmit = useCallback(async (data: TeacherFormData) => {
    setIsLoading(true);

    try {
      // Validate and prepare data
      const validation = validateAndPrepareTeacherData(data, true);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
      }

      const request = validation.data as UpdateTeacherRequest;
      const updatedTeacher = await updateTeacher(teacher.id, request);
      dispatch(updateTeacherInStore(updatedTeacher));

      // Clear teachers cache so other components refresh on next mount
      clearCache('teachers');

      showSuccessMessage('Teacher Updated', `${data.name} has been successfully updated.`);
      setHasUnsavedChanges(false);
      onClose();
      onSuccess();
    } catch (error) {
      const errorMessage = TeacherErrorHandlers.update(error);
      console.error('Failed to update teacher:', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [teacher.id, dispatch, onSuccess, onClose]);

  const handleConfirm = useCallback(() => {
    formRef.current?.submitForm();
  }, []);

  // Adapter for FormSheet's onOpenChange to onClose pattern
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onClose();
    }
  }, [onClose]);

  return (
    <FormSheet
      open={isOpen}
      onOpenChange={handleOpenChange}
      intent="primary"
      size="lg"
      icon={UserCog}
      title="Edit Teacher"
      description={`Update ${teacher.name}'s profile information.`}
      confirmText={isLoading ? 'Updating...' : 'Update Teacher'}
      cancelText="Cancel"
      onConfirm={handleConfirm}
      isLoading={isLoading}
      isDirty={hasUnsavedChanges}
    >
      {subjectsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      ) : (
        <TabbedTeacherFormContent
          ref={formRef}
          teacher={teacher}
          subjects={subjects}
          onSubmit={handleSubmit}
          onCancel={onClose}
          onFormChange={handleFormChange}
          hideButtons={true}
        />
      )}
    </FormSheet>
  );
};

export default EditTeacherSheet;
