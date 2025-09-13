import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import TeacherForm from '@/domains/teachers/components/TeacherForm';
import TeacherFilters from '@/domains/teachers/components/filters/TeacherFilters';
import TeacherTable from '@/domains/teachers/components/list/TeacherTable';
import TeacherLoading from '@/domains/teachers/components/state/TeacherLoading';
import { useTeacherManagement } from '@/domains/teachers/hooks/useTeacherManagement';

const Teachers: React.FC = () => {
  const [hasFormErrors, setHasFormErrors] = useState(false);
  
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
    isFormOpen,
    isConfirmOpen,
    selectedTeacher,
    teacherToDelete,
    
    // UI handlers
    handleAddTeacher,
    handleEditTeacher,
    handleDeleteTeacher,
    handleCloseForm,
    handleSubmit,
    confirmDeleteTeacher,
    clearFilters,
    
    // Filter handlers
    setSearchTerm,
    setSubjectFilter,
    
    // State setters
    setIsConfirmOpen,
  } = useTeacherManagement();

  // Reset form errors when form is closed
  useEffect(() => {
    if (!isFormOpen) {
      setHasFormErrors(false);
    }
  }, [isFormOpen]);

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
            disabled={isFormOpen && hasFormErrors}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={isFormOpen && hasFormErrors}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
      
      {/* Teacher Form Modal */}
      <TeacherForm
        teacher={selectedTeacher}
        subjects={subjects}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onFormStateChange={setHasFormErrors}
      />
      
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

