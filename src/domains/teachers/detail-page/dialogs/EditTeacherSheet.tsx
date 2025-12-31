import React, { useRef, useState, useCallback, useEffect } from 'react';
import { UserCog } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import { updateTeacher as updateTeacherInStore } from '@/domains/teachers/teachersSlice';
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
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // Get subjects from store or fetch them
  const storeSubjects = useAppSelector((state: RootState) => state.teachers.subjects);

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
      setShowUnsavedWarning(false);
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

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  const handleConfirmDiscard = useCallback(() => {
    setShowUnsavedWarning(false);
    setHasUnsavedChanges(false);
    onClose();
  }, [onClose]);

  const handleSaveAndClose = useCallback(() => {
    setShowUnsavedWarning(false);
    if (formRef.current) {
      formRef.current.submitForm();
    }
  }, []);

  // Intercept sheet close attempts when there are unsaved changes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else if (!newOpen) {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md lg:max-w-2xl p-0 bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-y-auto"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="px-4 py-4 border-b border-white/10">
              <SheetTitle className="flex items-center gap-2 text-white text-lg font-semibold">
                <UserCog className="w-5 h-5 text-blue-400" />
                Edit Teacher
              </SheetTitle>
              <SheetDescription className="text-white/70 mt-2">
                Update {teacher.name}'s profile information.
              </SheetDescription>
              {hasUnsavedChanges && (
                <div className="mt-3 flex items-center gap-2 text-sm text-amber-400">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <span>You have unsaved changes</span>
                </div>
              )}
            </SheetHeader>

            {/* Scrollable Form Content */}
            <ScrollArea className="flex-1">
              <div className="p-4">
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
                    onCancel={handleCancel}
                    onFormChange={handleFormChange}
                  />
                )}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Unsaved Changes Warning */}
      <ConfirmationDialog
        isOpen={showUnsavedWarning}
        onClose={() => setShowUnsavedWarning(false)}
        onConfirm={handleConfirmDiscard}
        onSave={handleSaveAndClose}
        title="Unsaved Changes"
        description="You have unsaved changes that will be lost if you close this dialog."
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        saveText="Save Changes"
        variant="danger"
        showSaveOption
      />
    </>
  );
};

export default EditTeacherSheet;
