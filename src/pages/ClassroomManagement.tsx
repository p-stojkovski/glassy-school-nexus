import React, { useState, useEffect } from 'react';
import { Plus, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import GlassCard from '@/components/common/GlassCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ClassroomForm from '@/domains/classrooms/components/ClassroomForm';
import ClassroomFilters from '@/domains/classrooms/components/filters/ClassroomFilters';
import ClassroomGrid from '@/domains/classrooms/components/list/ClassroomGrid';
import { useClassroomManagement } from '@/domains/classrooms/hooks/useClassroomManagement';

const ClassroomManagement: React.FC = () => {
  const [hasFormErrors, setHasFormErrors] = useState(false);
  
  const {
    // Data
    filteredClassrooms,
    loading,
    
    // Search state
    searchTerm,
    setSearchTerm,
    searchParams,
    isSearchMode,
    nameAvailability,

    // UI state
    isFormOpen,
    isConfirmOpen,
    selectedClassroom,
    classroomToDelete,

    // Handlers
    handleAddClassroom,
    handleEditClassroom,
    handleDeleteClassroom,
    handleViewClassroom,
    handleCloseForm,
    handleSubmit,
    confirmDeleteClassroom,
    checkNameAvailability,
    handleAdvancedSearch,
    clearFilters,

    // UI state setters
    setIsConfirmOpen,
  } = useClassroomManagement();

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || isSearchMode;

  // Reset form errors when form is closed
  useEffect(() => {
    if (!isFormOpen) {
      setHasFormErrors(false);
    }
  }, [isFormOpen]);

  // Global loading interceptor now handles initial page loading automatically
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Classroom Management
          </h1>
          <p className="text-white/70">
            Manage classroom information and availability
          </p>
        </div>
        <Button
          onClick={handleAddClassroom}
          disabled={isFormOpen && hasFormErrors}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Classroom
        </Button>
      </div>
      
      {/* Filters */}
      <ClassroomFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchParams={searchParams}
        isSearchMode={isSearchMode}
        isLoading={loading.searching}
        onSearch={handleAdvancedSearch}
        onClear={clearFilters}
      />
      
      {/* Classrooms Display */}
      {filteredClassrooms.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Building className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Classrooms Found
          </h3>
          <p className="text-white/60 mb-6">
            {hasActiveFilters
              ? 'No classrooms match your current search criteria.'
              : 'Start by adding your first classroom to the system.'}
          </p>
          {!hasActiveFilters && (
            <Button
              onClick={handleAddClassroom}
              disabled={isFormOpen && hasFormErrors}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Classroom
            </Button>
          )}
        </GlassCard>
      ) : (
        <ClassroomGrid
          classrooms={filteredClassrooms}
          searchTerm={searchTerm}
          onAddClassroom={handleAddClassroom}
          onEditClassroom={handleEditClassroom}
          onDeleteClassroom={handleDeleteClassroom}
          onViewClassroom={handleViewClassroom}
        />
      )}
      
      {/* Classroom Form Sidebar */}
      <Sheet open={isFormOpen} onOpenChange={handleCloseForm}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              {selectedClassroom ? 'Edit Classroom' : 'Add New Classroom'}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <ClassroomForm
              classroom={selectedClassroom}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              checkNameAvailability={checkNameAvailability}
              nameAvailability={nameAvailability}
              onFormStateChange={setHasFormErrors}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmDeleteClassroom}
        title="Delete Classroom"
        description={
          classroomToDelete
            ? `Are you sure you want to delete ${classroomToDelete.name}? This action cannot be undone.`
            : 'Are you sure you want to delete this classroom?'
        }
      />
    </div>
  );
};

export default ClassroomManagement;

