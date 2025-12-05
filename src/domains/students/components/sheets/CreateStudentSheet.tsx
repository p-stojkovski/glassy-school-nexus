import React, { useRef, useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import TabbedStudentFormContent, { StudentFormRef } from '@/domains/students/components/forms/TabbedStudentFormContent';
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
          className="w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 border-l border-white/10"
        >
          <SheetHeader className="space-y-4 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold text-white">
                Add New Student
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-sm text-amber-400">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span>You have unsaved changes</span>
              </div>
            )}
          </SheetHeader>

          <div className="mt-6">
            <TabbedStudentFormContent
              ref={formRef}
              student={null}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              onFormChange={handleFormChange}
            />
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

export default CreateStudentSheet;
