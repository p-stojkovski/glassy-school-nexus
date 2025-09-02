import React from 'react';
import StudentHeader from '@/domains/students/components/layout/StudentHeader';
import StudentFilters from '@/domains/students/components/filters/StudentFilters';
import StudentTable from '@/domains/students/components/list/StudentTable';
import StudentCard from '@/domains/students/components/list/StudentCard';
import StudentEmptyState from '@/domains/students/components/state/StudentEmptyState';
import StudentLoading from '@/domains/students/components/state/StudentLoading';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useStudentManagementWithNavigation } from '@/domains/students/hooks/useStudentManagementWithNavigation';

const StudentManagement: React.FC = () => {
  const {
    students,
    discountTypes,
    totalCount,
    currentPage,
    pageSize,
    isSearchMode,
    loading,
    errors,
    searchTerm,
    statusFilter,
    discountStatusFilter,
    discountTypeFilter,
    hasActiveFilters,
    viewMode,
    studentToDelete,
    isConfirmOpen,
    isInitialized,
    setIsConfirmOpen,
    setSearchTerm,
    setStatusFilter,
    setDiscountStatusFilter,
    setDiscountTypeFilter,
    clearFilters,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    handleViewStudent,
    confirmDeleteStudent,
    handlePageChange,
  } = useStudentManagementWithNavigation();

  // Show loading spinner while data is being initialized
  if (!isInitialized) {
    return <StudentLoading />;
  }

  return (
    <div className="space-y-6">
      <StudentHeader onAddStudent={handleAddStudent} />
      <StudentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        discountStatusFilter={discountStatusFilter}
        setDiscountStatusFilter={setDiscountStatusFilter}
        discountTypeFilter={discountTypeFilter}
        setDiscountTypeFilter={setDiscountTypeFilter}
        clearFilters={clearFilters}
        discountTypes={discountTypes}
        hasActiveFilters={hasActiveFilters}
        isSearchMode={isSearchMode}
        loading={loading.searching}
      />


      {students.length === 0 ? (
        <StudentEmptyState
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onAddStudent={handleAddStudent}
          hasActiveFilters={hasActiveFilters}
          isLoading={loading.searching}
        />
      ) : viewMode === 'table' ? (
        <StudentTable
          students={students}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onView={handleViewStudent}
          onPageChange={handlePageChange}
          loading={loading.searching}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onEdit={() => handleEditStudent(student)}
                onDelete={() => handleDeleteStudent(student)}
                onView={() => handleViewStudent(student)}
              />
            ))}
          </div>
          
          {/* Grid pagination - simplified */}
          {totalCount > pageSize && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-white/70">
                Page {currentPage} of {Math.ceil(totalCount / pageSize)}
              </span>
              <button
                onClick={() => currentPage < Math.ceil(totalCount / pageSize) && handlePageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={(open) => setIsConfirmOpen(open)}
        title="Delete Student"
        description={`Are you sure you want to delete ${studentToDelete?.fullName}? This action cannot be undone.`}
        onConfirm={confirmDeleteStudent}
        loading={loading.deleting}
      />
    </div>
  );
};

export default StudentManagement;
