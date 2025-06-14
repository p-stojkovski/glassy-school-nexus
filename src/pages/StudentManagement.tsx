
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import StudentHeader from '@/domains/students/components/layout/StudentHeader';
import StudentFilters from '@/domains/students/components/filters/StudentFilters';
import StudentTable from '@/domains/students/components/list/StudentTable';
import StudentForm from '@/domains/students/components/forms/StudentForm';
import StudentEmptyState from '@/domains/students/components/state/StudentEmptyState';
import StudentLoading from '@/domains/students/components/state/StudentLoading';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DemoModeNotification from '@/domains/students/components/notifications/DemoModeNotification';
import { useStudentManagement } from '@/domains/students/hooks/useStudentManagement';

const StudentManagement: React.FC = () => {  const {
    students,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    classFilter,
    setClassFilter,
    clearFilters,
    classes,
    getStudentPaymentStatus,
    isFormOpen,
    selectedStudent,
    studentToDelete,
    setStudentToDelete,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    confirmDeleteStudent,
    handleViewStudent,
    handleCloseForm,
    handleSubmit,
  } = useStudentManagement();

  if (loading) {
    return <StudentLoading />;
  }  return (
    <div className="space-y-6">
      <DemoModeNotification />
      <StudentHeader 
        onAddStudent={handleAddStudent}
      />      <StudentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        setPaymentStatusFilter={setPaymentStatusFilter}
        classFilter={classFilter}
        setClassFilter={setClassFilter}
        clearFilters={clearFilters}
        classes={classes}
      />

      {students.length === 0 ? (
        <StudentEmptyState
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onAddStudent={handleAddStudent}
        />      ) : (
        <StudentTable
          students={students}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onView={handleViewStudent}
          getPaymentStatus={getStudentPaymentStatus}
        />
      )}

      <Sheet open={isFormOpen} onOpenChange={handleCloseForm}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              {selectedStudent ? 'Edit Student' : 'Add New Student'}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <StudentForm
              student={selectedStudent}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </SheetContent>
      </Sheet>      <ConfirmDialog
        open={!!studentToDelete}
        onOpenChange={() => setStudentToDelete(null)}
        title="Delete Student"
        description={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
        onConfirm={confirmDeleteStudent}
      />
    </div>
  );
};

export default StudentManagement;
