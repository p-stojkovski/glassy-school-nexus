import React, { useRef, useState, useCallback, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
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
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
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
      setShowUnsavedWarning(false);
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

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      onOpenChange(false);
    }
  }, [hasUnsavedChanges, onOpenChange]);

  const handleConfirmDiscard = useCallback(() => {
    setShowUnsavedWarning(false);
    setHasUnsavedChanges(false);
    onOpenChange(false);
  }, [onOpenChange]);

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
    } else {
      onOpenChange(newOpen);
    }
  }, [hasUnsavedChanges, onOpenChange]);

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md lg:max-w-2xl p-0 bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-y-auto"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="px-4 py-4 border-b border-white/10">
              <SheetTitle className="flex items-center gap-2 text-white text-lg font-semibold">
                <UserPlus className="w-5 h-5 text-blue-400" />
                Add New Teacher
              </SheetTitle>
              <SheetDescription className="text-white/70 mt-2">
                Create a new teacher profile with essential information. You can add personal details and professional notes.
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
                    teacher={null}
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

export default CreateTeacherSheet;
