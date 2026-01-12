import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import PaymentSidebar from '@/domains/finance/components/payments/PaymentSidebar';
import { StudentPageHeader, CreateStudentSheet } from '@/domains/students/list-page';
import { CreateStudentHeader } from '@/domains/students/form-page';
import {
  StudentOverview,
  StudentClassesTab,
  StudentGradesTab,
  StudentPaymentsTab,
  StudentDetailsTab,
  useStudentPage,
  EditStudentSheet,
} from '@/domains/students/detail-page';
import type { StudentDetailSection } from '@/domains/students/detail-page';
import { useAppDispatch } from '@/store/hooks';
import { updateStudent as updateStudentInStore, Student } from '@/domains/students/studentsSlice';

/**
 * Unified Student Details Page
 * 
 * Handles both create mode (/students/new) and details mode (/students/:studentId)
 * Mirrors the ClassPage experience with consistent header, tabs, and inline editing
 */
const StudentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const {
    isCreateMode,
    student,
    studentClass,
    obligations,
    payments,
    outstandingBalance,
    attendanceStats,
    gradeAssessments,
    overviewData,
    overviewLoading,
    activeTab,
    setActiveTab,
    isPaymentSidebarOpen,
    selectedObligation,
    isEditSheetOpen,
    loading,
    error,
    isDeleting,
    handleOpenPaymentSidebar,
    handleClosePaymentSidebar,
    openEditSheet,
    closeEditSheet,
    handleUpdate,
    handleCreate,
    handleToggleStatus,
    handleDelete,
    canViewFinance,
    canManagePayments,
    canDelete,
    deleteDisabledReason,
    canMakePayment,
    getAttendanceStatusColor,
    getPaymentStatusColor,
  } = useStudentPage();

  // Track create sheet state
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  
  // Track which section to focus when navigating to Details tab
  const [focusSection, setFocusSection] = useState<StudentDetailSection | null>(null);

  // Open create sheet on mount in create mode
  useEffect(() => {
    if (isCreateMode) {
      setShowCreateSheet(true);
    }
  }, [isCreateMode]);

  // Handle successful student creation
  const handleStudentCreated = useCallback((newStudentId: string) => {
    navigate(`/students/${newStudentId}`, { replace: true });
  }, [navigate]);

  // Handle tab change
  const handleTabChange = (newTab: string) => {
    // Don't allow switching to payments tab if user can't view finance
    if (newTab === 'payments' && !canViewFinance) {
      return;
    }
    setActiveTab(newTab);
  };

  // Handle navigation to Details tab with section focus (from Overview summary cards)
  const handleEditSection = useCallback((section: StudentDetailSection) => {
    setFocusSection(section);
    setActiveTab('details');
  }, [setActiveTab]);

  // Handle clearing focus section after it's been handled
  const handleFocusSectionHandled = useCallback(() => {
    setFocusSection(null);
  }, []);

  // Handle student update from Details tab
  const handleStudentUpdate = useCallback((updatedStudent: Student) => {
    dispatch(updateStudentInStore(updatedStudent));
  }, [dispatch]);

  // Create mode
  if (isCreateMode) {
    return (
      <div className="space-y-6">
        <CreateStudentHeader onOpenCreateSheet={() => setShowCreateSheet(true)} />
        
        {/* Placeholder content when in create mode */}
        <div className="text-center py-16">
          <div className="text-white/50 text-lg mb-4">
            Complete the form to add your new student
          </div>
        </div>

        {/* Create Student Sheet */}
        <CreateStudentSheet
          open={showCreateSheet}
          onOpenChange={(open) => {
            if (!open) {
              // If user closes the sheet without creating, go back to students list
              navigate('/students');
            }
            setShowCreateSheet(open);
          }}
          onSuccess={handleStudentCreated}
          onSubmit={handleCreate}
        />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !student) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/students')}
          className="text-white/80 hover:text-white transition-colors mb-4"
        >
          ← Back to Students
        </button>
        <ErrorMessage
          title="Error Loading Student"
          message={error || 'Student not found'}
          onRetry={() => window.location.reload()}
          showRetry
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Unified Header */}
      <StudentPageHeader
        student={student}
        studentClass={studentClass}
        outstandingBalance={outstandingBalance}
        onEdit={openEditSheet}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        isDeleting={isDeleting}
        canDelete={canDelete}
        deleteDisabledReason={deleteDisabledReason || undefined}
      />

      {/* Main Tabs - Clean underline style consistent with ClassPage */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-transparent border-b border-white/[0.08] rounded-none p-0 h-auto gap-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="classes"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            Classes
          </TabsTrigger>
          <TabsTrigger
            value="grades"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            Grades
          </TabsTrigger>
          {/* Only show Payments tab for users with finance permissions */}
          {canViewFinance && (
            <TabsTrigger
              value="payments"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
            >
              Payments
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <StudentOverview
            student={student}
            overviewData={overviewData}
            overviewLoading={overviewLoading}
            onEditSection={handleEditSection}
          />
        </TabsContent>

        {/* Details Tab - Primary editing experience */}
        <TabsContent value="details" className="mt-6">
          <StudentDetailsTab
            student={student}
            onUpdate={handleStudentUpdate}
            focusSection={focusSection}
            onFocusSectionHandled={handleFocusSectionHandled}
          />
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="mt-6">
          <StudentClassesTab
            studentId={student.id}
            currentClassId={student.currentClassId}
          />
        </TabsContent>

        {/* Grades Tab */}
        <TabsContent value="grades" className="mt-6">
          <StudentGradesTab gradeAssessments={gradeAssessments} />
        </TabsContent>

        {/* Payments Tab - Only render if user has finance permissions */}
        {canViewFinance && (
          <TabsContent value="payments" className="mt-6">
            <StudentPaymentsTab
              obligations={obligations}
              payments={payments}
              onOpenPaymentSidebar={canManagePayments ? handleOpenPaymentSidebar : () => {}}
              canMakePayment={canManagePayments ? canMakePayment : () => false}
              getPaymentStatusColor={getPaymentStatusColor}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Payment Sidebar - Only for users with payment management permissions */}
      {canManagePayments && (
        <PaymentSidebar
          isOpen={isPaymentSidebarOpen}
          onClose={handleClosePaymentSidebar}
          obligation={selectedObligation}
          studentName={student.fullName}
        />
      )}

      {/* Edit Student Sidebar */}
      <EditStudentSheet
        student={student}
        open={isEditSheetOpen}
        onOpenChange={(open) => !open && closeEditSheet()}
        onSuccess={() => {}}
        onSubmit={handleUpdate}
      />
    </div>
  );
};

export default StudentPage;
