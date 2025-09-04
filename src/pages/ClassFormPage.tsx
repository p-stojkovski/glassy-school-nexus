import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import ClassFormContent from '@/domains/classes/components/forms/ClassFormContent';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useClassFormPage } from '@/domains/classes/hooks/useClassFormPage';
import { useUnsavedChangesWarning } from '@/domains/students/hooks/useUnsavedChangesWarning';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ClassFormData } from '@/types/api/class';
import { ClassFormRef } from '@/domains/classes/components/forms/ClassFormContent';

const ClassFormPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(classId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState<ClassFormData | null>(null);
  const formRef = useRef<ClassFormRef>(null);

  const {
    classItem,
    // Removed teachers, classrooms - dropdown components handle data themselves
    loading,
    error,
    handleSubmit,
    handleCancel,
  } = useClassFormPage(classId);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (formRef.current) {
      setIsSaving(true);
      formRef.current.submitForm();
    }
  };

  const {
    navigateWithWarning,
    dialogState,
    closeDialog,
    handleConfirm,
    handleSave: handleDialogSave,
  } = useUnsavedChangesWarning(
    hasUnsavedChanges,
    'You have unsaved changes that will be lost if you leave this page.',
    handleSave
  );

  // Handle navigation for non-existent class
  useEffect(() => {
    if (isEditMode && !loading && !classItem && !error) {
      navigate('/classes', { replace: true });
    }
  }, [isEditMode, loading, classItem, error, navigate]);

  // Rely on the global loading overlay to avoid duplicate spinners
  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div className="w-full">
        <ErrorMessage
          title="Error Loading Class"
          message={error}
          onRetry={() => window.location.reload()}
          showRetry
        />
      </div>
    );
  }

  if (isEditMode && !classItem) {
    return (
      <div className="w-full">
        <ErrorMessage
          title="Class Not Found"
          message="The requested class could not be found."
          onRetry={() => navigate('/classes')}
          retryText="Back to Classes"
          showRetry
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header with Back Button */}
      <div className="space-y-4">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList className="text-white/70">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/50" />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/classes" className="hover:text-white transition-colors">
                  Classes
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/50" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white font-medium">
                {isEditMode ? `Edit ${classItem?.name}` : 'Add Class'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigateWithWarning('/classes')}
            className="text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Classes
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              {isEditMode ? 'Edit Class' : 'Add New Class'}
              {hasUnsavedChanges && (
                <span className="text-amber-400 text-sm font-normal px-2 py-1 bg-amber-500/20 rounded-md border border-amber-500/30">
                  Unsaved Changes
                </span>
              )}
            </h1>
            <p className="text-white/70">
              {isEditMode && classItem
                ? `Update information for ${classItem.name}`
                : 'Add a new class to the system'}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <ClassFormContent
          ref={formRef}
          classItem={classItem}
          onSubmit={(data) => {
            setFormData(data);
            setHasUnsavedChanges(false);
            handleSubmit(data);
          }}
          onCancel={() => navigateWithWarning('/classes')}
          onFormChange={(data) => {
            setFormData(data);
            setHasUnsavedChanges(true);
          }}
        />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        onSave={dialogState.showSaveOption ? handleDialogSave : undefined}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        saveText={dialogState.saveText}
        variant={dialogState.variant}
        showSaveOption={dialogState.showSaveOption}
      />
    </div>
  );
};

export default ClassFormPage;
