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
import StudentFormContent from '@/domains/students/components/forms/StudentFormContent';
import StudentLoading from '@/domains/students/components/state/StudentLoading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useStudentFormPage } from '@/domains/students/hooks/useStudentFormPage';
import { useUnsavedChangesWarning } from '@/domains/students/hooks/useUnsavedChangesWarning';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { StudentFormData } from '@/types/api/student';
import { StudentFormRef } from '@/domains/students/components/forms/StudentFormContent';

const StudentFormPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(studentId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState<StudentFormData | null>(null);
  const formRef = useRef<StudentFormRef>(null);

  const {
    student,
    loading,
    error,
    handleSubmit,
    handleCancel,
  } = useStudentFormPage(studentId);

  const [isSaving, setIsSaving] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

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

  // Handle navigation for non-existent student
  useEffect(() => {
    if (isEditMode && !loading && !student && !error) {
      navigate('/students', { replace: true });
    }
  }, [isEditMode, loading, student, error, navigate]);

  // Show loading spinner while student data is being loaded
  if (loading) {
    return <StudentLoading />;
  }

  if (error) {
    return (
      <div className="w-full">
        <ErrorMessage
          title="Error Loading Student"
          message={error}
          onRetry={() => window.location.reload()}
          showRetry
        />
      </div>
    );
  }

  if (isEditMode && !student) {
    return (
      <div className="w-full">
        <ErrorMessage
          title="Student Not Found"
          message="The requested student could not be found."
          onRetry={() => navigate('/students')}
          retryText="Back to Students"
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
                <Link to="/students" className="hover:text-white transition-colors">
                  Students
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/50" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white font-medium">
                {isEditMode ? `Edit ${student?.name}` : 'Add Student'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigateWithWarning('/students')}
            className="text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Students
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              {isEditMode ? 'Edit Student' : 'Add New Student'}
              {hasUnsavedChanges && (
                <span className="text-amber-400 text-sm font-normal px-2 py-1 bg-amber-500/20 rounded-md border border-amber-500/30">
                  Unsaved Changes
                </span>
              )}
            </h1>
            <p className="text-white/70">
              {isEditMode && student
                ? `Update information for ${student.name}`
                : 'Add a new student to the system'}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <StudentFormContent
          ref={formRef}
          student={student}
          onSubmit={(data) => {
            setFormData(data);
            setHasUnsavedChanges(false);
            handleSubmit(data);
          }}
          onCancel={() => navigateWithWarning('/students')}
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

export default StudentFormPage;

