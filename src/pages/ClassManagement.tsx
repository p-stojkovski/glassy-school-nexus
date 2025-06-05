
import React from 'react';
import { useClassManagement } from '../hooks/useClassManagement';
import ClassHeader from '../components/classes/ClassHeader';
import ClassFilters from '../components/classes/ClassFilters';
import ClassCard from '../components/classes/ClassCard';
import ClassEmptyState from '../components/classes/ClassEmptyState';
import ClassLoading from '../components/classes/ClassLoading';
import ClassForm from '../components/classes/ClassForm';
import ClassDetails from '../components/classes/ClassDetails';
import ConfirmDialog from '../components/common/ConfirmDialog';

const ClassManagement: React.FC = () => {
  const {
    // State
    loading,
    filteredClasses,
    searchTerm,
    statusFilter,
    subjectFilter,
    classToDelete,
    showClassForm,
    editingClass,
    selectedClass,
    showClassDetails,
    
    // Setters
    setSearchTerm,
    setStatusFilter,
    setSubjectFilter,
    setClassToDelete,
    setShowClassForm,
    setEditingClass,
    setShowClassDetails,
    
    // Handlers
    handleCreateClass,
    handleEditClass,
    confirmDeleteClass,
    handleViewDetails,
    handleEditFromDetails,
    handleDeleteFromDetails,
  } = useClassManagement();

  if (loading) {
    return <ClassLoading />;
  }

  const hasFilters = searchTerm || statusFilter !== 'all' || subjectFilter !== 'all';

  return (
    <div className="space-y-6">
      <ClassHeader onAddClass={() => setShowClassForm(true)} />

      <ClassFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        subjectFilter={subjectFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onSubjectFilterChange={setSubjectFilter}
      />

      {filteredClasses.length === 0 ? (
        <ClassEmptyState
          hasFilters={hasFilters}
          onCreateClass={() => setShowClassForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onView={handleViewDetails}
              onEdit={(classItem) => {
                setEditingClass(classItem);
                setShowClassForm(true);
              }}
              onDelete={(classItem) => {
                setClassToDelete(classItem);
              }}
            />
          ))}
        </div>
      )}

      <ClassForm
        open={showClassForm}
        onOpenChange={(open) => {
          setShowClassForm(open);
          if (!open) setEditingClass(null);
        }}
        onSubmit={editingClass ? handleEditClass : handleCreateClass}
        editingClass={editingClass}
      />

      <ClassDetails
        classItem={selectedClass}
        open={showClassDetails}
        onOpenChange={setShowClassDetails}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
      />

      <ConfirmDialog
        open={!!classToDelete}
        onOpenChange={() => setClassToDelete(null)}
        title="Delete Class"
        description={`Are you sure you want to delete ${classToDelete?.name}? This action cannot be undone.`}
        onConfirm={confirmDeleteClass}
      />
    </div>
  );
};

export default ClassManagement;
