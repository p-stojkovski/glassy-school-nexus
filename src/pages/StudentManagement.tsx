import React from 'react';
import { StudentHeader } from '@/domains/students/detail-page';
import {
  StudentFilters,
  StudentTable,
  useStudentsListPage,
} from '@/domains/students/list-page';
import { StudentEmptyState, StudentLoading } from '@/domains/students/_shared';

const StudentManagement: React.FC = () => {
  const {
    students,
    totalCount,
    currentPage,
    pageSize,
    searchTerm,
    statusFilter,
    teacherFilter,
    discountFilter,
    paymentFilter,
    teachers,
    hasActiveFilters,
    isInitialized,
    isSearching,
    setSearchTerm,
    setStatusFilter,
    setTeacherFilter,
    setDiscountFilter,
    setPaymentFilter,
    clearFilters,
    handleAddStudent,
    handleViewStudent,
    handlePageChange,
  } = useStudentsListPage();

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
        teacherFilter={teacherFilter}
        setTeacherFilter={setTeacherFilter}
        discountFilter={discountFilter}
        setDiscountFilter={setDiscountFilter}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        teachers={teachers}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        isSearching={isSearching}
      />


      {!students || students.length === 0 ? (
        <StudentEmptyState
          hasActiveFilters={hasActiveFilters}
          onAddStudent={handleAddStudent}
        />
      ) : (
        <StudentTable
          students={students}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onView={handleViewStudent}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default StudentManagement;

