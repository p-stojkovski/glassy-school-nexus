import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherManagement } from '../_shared/hooks/useTeacherManagement';
import { TeacherHeader, TeacherFilters, TeacherEmptyState } from './components';
import TeacherTable from './TeacherTable';
import { CreateTeacherSheet } from './dialogs';
import { TeacherLoading } from '../_shared/components';

const Teachers: React.FC = () => {
  const navigate = useNavigate();
  const {
    teachers,
    subjects,
    totalCount,
    currentPage,
    pageSize,
    loading,
    isInitialized,
    searchTerm,
    statusFilter,
    subjectFilter,
    experienceFilter,
    hasActiveFilters,
    isFormOpen,
    setSearchTerm,
    setStatusFilter,
    setSubjectFilter,
    setExperienceFilter,
    clearFilters,
    handleAddTeacher,
    handlePageChange,
    setIsFormOpen,
  } = useTeacherManagement();

  const handleViewTeacher = (teacher: { id: string }) => {
    navigate(`/teachers/${teacher.id}`);
  };

  if (!isInitialized) {
    return <TeacherLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <TeacherHeader onAddTeacher={handleAddTeacher} />

      {/* Filters */}
      <TeacherFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        experienceFilter={experienceFilter}
        setExperienceFilter={setExperienceFilter}
        subjects={subjects}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        isSearching={loading.searching}
      />

      {/* Table or Empty State */}
      {teachers.length === 0 ? (
        <TeacherEmptyState
          hasActiveFilters={hasActiveFilters}
          onAddTeacher={handleAddTeacher}
        />
      ) : (
        <TeacherTable
          teachers={teachers}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onView={handleViewTeacher}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create Teacher Sheet */}
      <CreateTeacherSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
    </div>
  );
};

export default Teachers;
