import React, { useEffect, useState } from 'react';
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
import { DemoManager } from '@/data/components/DemoManager';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useStudentFormPage } from '@/domains/students/hooks/useStudentFormPage';
import { useUnsavedChangesWarning } from '@/domains/students/hooks/useUnsavedChangesWarning';

const StudentFormPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(studentId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    student,
    loading,
    error,
    handleSubmit,
    handleCancel,
  } = useStudentFormPage(studentId);

  const { navigateWithWarning } = useUnsavedChangesWarning(
    hasUnsavedChanges,
    'You have unsaved changes. Are you sure you want to leave?'
  );

  // Handle navigation for non-existent student
  useEffect(() => {
    if (isEditMode && !loading && !student && !error) {
      navigate('/students', { replace: true });
    }
  }, [isEditMode, loading, student, error, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
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
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isEditMode ? 'Edit Student' : 'Add New Student'}
            </h1>
            <p className="text-white/70">
              {isEditMode && student
                ? `Update information for ${student.name}`
                : 'Add a new student to the system'}
            </p>
          </div>
        </div>
      </div>

      <DemoManager
        showFullControls={true}
        title={`${isEditMode ? 'Edit' : 'Add'} Student Demo`}
        description="Student information is stored locally and persists between sessions."
      />

      <div className="w-full">
        <StudentFormContent
          student={student}
          onSubmit={(data) => {
            setHasUnsavedChanges(false);
            handleSubmit(data);
          }}
          onCancel={() => navigateWithWarning('/students')}
          onFormChange={() => setHasUnsavedChanges(true)}
        />
      </div>
    </div>
  );
};

export default StudentFormPage;