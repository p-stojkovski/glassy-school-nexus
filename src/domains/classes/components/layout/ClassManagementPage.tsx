import React from 'react';
import ClassHeader from './ClassHeader';
import ClassFilters from '../filters/ClassFilters';
import ClassCard from '../list/ClassCard';
import ClassEmptyState from '../state/ClassEmptyState';
import ClassLoading from '../state/ClassLoading';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { DemoManager } from '@/data/components/DemoManager';
import { useClassManagementPage } from '../../hooks/useClassManagementPage';

const ClassManagementPage: React.FC = () => {
  const {
    // Data
    filteredClasses,
    loading,
    hasFilters,

    // Filter state
    searchTerm,
    setSearchTerm,
    subjectFilter,
    statusFilter,
    showOnlyWithAvailableSlots,

    // UI state
    showDeleteDialog,
    setShowDeleteDialog,
    classToDelete, // Handlers
    handleAddClass,
    handleEdit,
    handleDelete,
    handleView,
    confirmDelete,
    handleFilterChange,
  } = useClassManagementPage();

  if (loading) {
    return <ClassLoading />;
  }
  return (
    <div className="space-y-6">
      <DemoManager
        showFullControls={true}
        title="Class Management Demo"
        description="Manage classes, schedules, and enrollment. All data is stored locally and persists between sessions."
      />

      <ClassHeader onAddClass={handleAddClass} />

      <ClassFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        subjectFilter={subjectFilter}
        statusFilter={statusFilter}
        showOnlyWithAvailableSlots={showOnlyWithAvailableSlots}
        onFilterChange={handleFilterChange}
      />

      {filteredClasses.length === 0 ? (
        <ClassEmptyState
          onCreateClass={handleAddClass}
          hasFilters={hasFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Class"
        description={`Are you sure you want to delete ${classToDelete?.name}? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ClassManagementPage;
