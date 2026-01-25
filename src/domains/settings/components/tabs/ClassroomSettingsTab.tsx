import React, { useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/dialogs';
import { ClassroomFormSheet } from '@/domains/classrooms/dialogs';
import { SettingsTable, type SettingsTableColumn } from '../../_shared/components';
import { useClassroomManagement } from '@/domains/classrooms/hooks/useClassroomManagement';
import { Classroom } from '@/domains/classrooms/classroomsSlice';

const ClassroomSettingsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

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

  // Handle row click - opens edit sheet
  const handleRowClick = useCallback((classroom: Classroom) => {
    handleEditClassroom(classroom);
  }, [handleEditClassroom]);

  // Handle delete from within the sheet
  const handleDeleteFromSheet = useCallback(() => {
    if (selectedClassroom) {
      handleDeleteClassroom(selectedClassroom);
    }
  }, [selectedClassroom, handleDeleteClassroom]);

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
        columns={columns}
        data={filteredClassrooms}
        onAdd={handleAddClassroom}
        onRowClick={handleRowClick}
        hideActionsColumn={true}
        showNavigationArrow={true}
        addButtonText="Add Classroom"
        emptyStateTitle="No Classrooms Found"
        emptyStateDescription="Start by adding your first classroom to the system."
        isLoading={loading.fetching || loading.searching}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search classrooms by name..."
        searchKeys={['name', 'location']}
      />

      {/* Classroom Form Sheet */}
      <ClassroomFormSheet
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        classroom={selectedClassroom}
        onSubmit={handleSubmit}
        onDelete={handleDeleteFromSheet}
        checkNameAvailability={checkNameAvailability}
        nameAvailability={nameAvailability}
        isLoading={loading.creating || loading.updating}
      />
      
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

