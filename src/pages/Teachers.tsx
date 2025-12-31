import React, { useState, useCallback } from 'react';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { CreateTeacherSheet } from '@/domains/teachers/list-page';
import { EditTeacherSheet } from '@/domains/teachers/detail-page';
import { TeacherFilters, TeacherTable } from '@/domains/teachers/list-page';
import { TeacherLoading, useTeacherManagement } from '@/domains/teachers/_shared';
import { TeacherFormData } from '@/types/api/teacher';
import { Teacher } from '@/domains/teachers/teachersSlice';

const Teachers: React.FC = () => {
  // Local state for create/edit sheets
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);

  // Use the comprehensive teacher management hook
  const {
    // Data
    subjects,
    filteredTeachers,

    // Loading states
    loading,
    isLoading,
    isInitialized,

    // Error states
    errors,

    // Filter state
    searchTerm,
    subjectFilter,
    hasActiveFilters,

    // UI state
    isConfirmOpen,
    teacherToDelete,

    // UI handlers
    handleDeleteTeacher,
    confirmDeleteTeacher,
    clearFilters,

    // Filter handlers
    setSearchTerm,
    setSubjectFilter,

    // State setters
    setIsConfirmOpen,

    // CRUD operations
    createTeacher,
    updateTeacher,
  } = useTeacherManagement();

  // Handle opening create sheet
  const handleAddTeacher = useCallback(() => {
    setIsCreateOpen(true);
  }, []);

  // Handle opening edit sheet
  const handleEditTeacher = useCallback((teacher: Teacher) => {
    setTeacherToEdit(teacher);
    setIsEditOpen(true);
  }, []);

  // Handle create submission
  const handleCreateSubmit = useCallback(async (data: TeacherFormData): Promise<{ id: string }> => {
    return await createTeacher(data);
  }, [createTeacher]);

  // Handle edit submission
  const handleEditSubmit = useCallback(async (data: TeacherFormData): Promise<void> => {
    if (teacherToEdit) {
      await updateTeacher(teacherToEdit.id, data);
    }
  }, [teacherToEdit, updateTeacher]);

  // Handle create success
  const handleCreateSuccess = useCallback((teacherId: string) => {
    setIsCreateOpen(false);
  }, []);

  // Handle edit success
  const handleEditSuccess = useCallback(() => {
    setIsEditOpen(false);
    setTeacherToEdit(null);
  }, []);

  // Show loading spinner while data is being initialized
  if (!isInitialized) {
    return <TeacherLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Teacher Management
          </h1>
          <p className="text-white/70">
            Manage teacher profiles and information
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleAddTeacher}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <TeacherFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        clearFilters={clearFilters}
      />

      {/* Teachers Display */}
      {filteredTeachers.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Teachers Found
          </h3>
          <p className="text-white/60 mb-6">
            {hasActiveFilters
              ? 'No teachers match your current search criteria.'
              : 'Start by adding your first teacher to the system.'}
          </p>
          {!hasActiveFilters && (
            <Button
              onClick={handleAddTeacher}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Teacher
            </Button>
          )}
        </GlassCard>
      ) : (
        <TeacherTable
          teachers={filteredTeachers}
          onEdit={handleEditTeacher}
          onDelete={handleDeleteTeacher}
          isDeleting={loading.deleting}
        />
      )}

      {/* Create Teacher Sheet */}
      <CreateTeacherSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreateSuccess}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Teacher Sheet */}
      {teacherToEdit && (
        <EditTeacherSheet
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setTeacherToEdit(null);
          }}
          onSuccess={handleEditSuccess}
          teacher={teacherToEdit}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={() => !loading.deleting && setIsConfirmOpen(false)}
        onConfirm={confirmDeleteTeacher}
        title="Delete Teacher"
        description={
          teacherToDelete
            ? `Are you sure you want to delete ${teacherToDelete.name}? This action cannot be undone.`
            : 'Are you sure you want to delete this teacher?'
        }
        confirmText={loading.deleting ? 'Deleting...' : 'Delete'}
        isLoading={loading.deleting}
        disabled={loading.deleting}
      />
    </div>
  );
};

export default Teachers;
