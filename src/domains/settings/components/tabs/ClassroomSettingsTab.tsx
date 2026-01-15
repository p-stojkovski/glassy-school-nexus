import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ConfirmDialog } from '@/components/common/dialogs';
import ClassroomForm from '@/domains/classrooms/components/ClassroomForm';
import SettingsTable, { SettingsTableColumn } from '../shared/SettingsTable';
import { useClassroomManagement } from '@/domains/classrooms/hooks/useClassroomManagement';
import { Classroom } from '@/domains/classrooms/classroomsSlice';

const ClassroomSettingsTab: React.FC = () => {
  const [hasFormErrors, setHasFormErrors] = useState(false);
  
  const {
    // Data
    filteredClassrooms,
    loading,
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
    handleCloseForm,
    handleSubmit,
    confirmDeleteClassroom,
    checkNameAvailability,

    // UI state setters
    setIsConfirmOpen,
  } = useClassroomManagement();

  // Reset form errors when form is closed
  useEffect(() => {
    if (!isFormOpen) {
      setHasFormErrors(false);
    }
  }, [isFormOpen]);

  // Define columns for the classroom table
  const columns: SettingsTableColumn[] = [
    {
      key: 'name',
      label: 'Name',
      width: '40%',
    },
    {
      key: 'capacity',
      label: 'Capacity',
      width: '20%',
      render: (capacity: number) => (
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          {capacity} students
        </Badge>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      width: '40%',
      render: (location: string | null) => location || 'Not specified',
    },
  ];

  return (
    <>
      <SettingsTable
        title="Classrooms"
        description="Manage classroom information and availability"
        columns={columns}
        data={filteredClassrooms}
        onAdd={handleAddClassroom}
        onEdit={handleEditClassroom}
        onDelete={handleDeleteClassroom}
        addButtonText="Add Classroom"
        emptyStateTitle="No Classrooms Found"
        emptyStateDescription="Start by adding your first classroom to the system."
        isLoading={loading.fetching || loading.searching}
      />

      {/* Classroom Form Sidebar */}
      <Sheet open={isFormOpen} onOpenChange={handleCloseForm}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto glass-scrollbar"
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
        intent="danger"
        icon={Trash2}
        title="Delete Classroom"
        description={
          classroomToDelete
            ? `Are you sure you want to delete ${classroomToDelete.name}? This action cannot be undone.`
            : 'Are you sure you want to delete this classroom?'
        }
        confirmText="Delete"
        onConfirm={confirmDeleteClassroom}
      />
    </>
  );
};

export default ClassroomSettingsTab;

