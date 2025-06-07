
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import StudentHeader from '../components/students/StudentHeader';
import StudentFilters from '../components/students/StudentFilters';
import StudentTable from '../components/students/StudentTable';
import StudentForm from '../components/students/StudentForm';
import StudentEmptyState from '../components/students/StudentEmptyState';
import StudentLoading from '../components/students/StudentLoading';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DemoModeNotification from '../components/students/DemoModeNotification';
import { useStudentManagement } from '../hooks/useStudentManagement';

const StudentManagement: React.FC = () => {  const {
    students,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
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
      />

      <StudentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
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
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onView={handleViewStudent}
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
