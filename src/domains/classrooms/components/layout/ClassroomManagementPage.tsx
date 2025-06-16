import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ClassroomForm from '../ClassroomForm';
import { DemoManager } from '@/data/components/DemoManager';
import ClassroomHeader from './ClassroomHeader';
import ClassroomFilters from '../filters/ClassroomFilters';
import ClassroomGrid from '../list/ClassroomGrid';
import { useClassroomManagement } from '../../hooks/useClassroomManagement';

const ClassroomManagementPage: React.FC = () => {
  const {
    // Data
    filteredClassrooms,
    loading, // Filter state
    searchTerm,
    setSearchTerm,

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

    // UI state setters
    setIsConfirmOpen,
  } = useClassroomManagement();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <DemoManager
        showFullControls={true}
        title="Classroom Management Demo"
        description="Manage classroom facilities and resources. All data is stored locally and persists between sessions."
      />
      <ClassroomHeader onAddClassroom={handleAddClassroom} />{' '}
      <ClassroomFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ClassroomGrid
        classrooms={filteredClassrooms}
        searchTerm={searchTerm}
        onAddClassroom={handleAddClassroom}
        onEditClassroom={handleEditClassroom}
        onDeleteClassroom={handleDeleteClassroom}
        onViewClassroom={handleViewClassroom}
      />
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
            />
          </div>
        </SheetContent>
      </Sheet>
      {/* Confirm Dialog */}
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

export default ClassroomManagementPage;
