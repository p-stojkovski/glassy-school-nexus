import React, { useState, useEffect } from 'react';
import { Plus, Users, Grid3x3, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import GlassCard from '@/components/common/GlassCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import TeacherCard from '@/domains/teachers/components/TeacherCard';
import TeacherForm from '@/domains/teachers/components/TeacherForm';
import TeacherFilters from '@/domains/teachers/components/filters/TeacherFilters';
import TeacherTable from '@/domains/teachers/components/list/TeacherTable';
import { Teacher } from '@/domains/teachers/teachersSlice';
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
    
    // Error states
    errors,
    
    // Filter state
    searchTerm,
    subjectFilter,
    hasActiveFilters,
    
    // View state
    viewMode,
    setViewMode,
    
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

  // Global loading interceptor now handles initial page loading automatically
  // Only specific loading states (delete, form submission) are handled locally

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
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'table')}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid3x3 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <Table2 className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
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
        subjects={subjects}
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
      ) : viewMode === 'table' ? (
        <TeacherTable 
          teachers={filteredTeachers} 
          onEdit={handleEditTeacher} 
          onDelete={handleDeleteTeacher}
          isDeleting={loading.deleting}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onEdit={() => handleEditTeacher(teacher)}
              onDelete={() => handleDeleteTeacher(teacher)}
              isDeleting={loading.deleting}
            />
          ))}
        </div>
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
