import React, { useRef, useState, useCallback, useEffect } from 'react';
import { User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
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
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
                <User className="w-5 h-5 text-blue-400" />
                Edit Student
              </SheetTitle>
              <SheetDescription className="text-white/70 mt-2">
                Update student profile information including personal, guardian, and financial details.
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
                <TabbedStudentFormContent
                  ref={formRef}
                  student={student}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  onFormChange={handleFormChange}
                  hideButtons={true}
                />
              </div>
            </ScrollArea>

            {/* Sticky Footer with Action Buttons */}
            <SheetFooter className="p-4 border-t border-white/10">
              <div className="flex gap-3 w-full">
                <Button
                  type="submit"
                  onClick={() => formRef.current?.submitForm()}
                  disabled={isSubmitting}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  {isSubmitting ? 'Updating...' : 'Update Student'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </SheetFooter>
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

export default EditStudentSheet;
