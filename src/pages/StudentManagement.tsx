import React from 'react';
import StudentHeader from '@/domains/students/components/layout/StudentHeader';
import StudentFilters from '@/domains/students/components/filters/StudentFilters';
import StudentTable from '@/domains/students/components/list/StudentTable';
import StudentEmptyState from '@/domains/students/components/state/StudentEmptyState';
import StudentLoading from '@/domains/students/components/state/StudentLoading';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StandardDemoNotice from '@/components/common/StandardDemoNotice';
import { useStudentManagementWithNavigation } from '@/domains/students/hooks/useStudentManagementWithNavigation';

const StudentManagement: React.FC = () => {
  const {
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
    handleViewStudent,
    studentToDelete,
    setStudentToDelete,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    confirmDeleteStudent,
  } = useStudentManagementWithNavigation();

  if (loading) {
    return <StudentLoading />;
  }
  return (
    <div className="space-y-6">
      <StandardDemoNotice
        title="Student Management Demo"
        message="Manage student information and enrollment. All data is stored locally and persists between sessions."
      />

      <StudentHeader onAddStudent={handleAddStudent} />
      <StudentFilters
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
        />
      ) : (
        <StudentTable
          students={students}
          classes={classes}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onView={handleViewStudent}
          getPaymentStatus={getStudentPaymentStatus}
          loading={loading}
        />
      )}

      <ConfirmDialog
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
