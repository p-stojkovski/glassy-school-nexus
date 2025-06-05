
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClassManagement } from '../hooks/useClassManagement';
import ClassHeader from '../components/classes/ClassHeader';
import ClassFilters from '../components/classes/ClassFilters';
import ClassCard from '../components/classes/ClassCard';
import ClassEmptyState from '../components/classes/ClassEmptyState';
import ClassLoading from '../components/classes/ClassLoading';
import ClassDetails from '../components/classes/ClassDetails';
import ConfirmDialog from '../components/common/ConfirmDialog';

const ClassManagement: React.FC = () => {
  const navigate = useNavigate();
  const {
    // State
    loading,
    filteredClasses,
    searchTerm,
    statusFilter,
    subjectFilter,
    classToDelete,
    selectedClass,
    showClassDetails,
    
    // Setters
    setSearchTerm,
    setStatusFilter,
    setSubjectFilter,
    setClassToDelete,
    setShowClassDetails,
    setSelectedClass,
    
    // Handlers
    confirmDeleteClass,
    handleViewDetails,
    handleDeleteFromDetails,
  } = useClassManagement();

  if (loading) {
    return <ClassLoading />;
  }

  const hasFilters = searchTerm || statusFilter !== 'all' || subjectFilter !== 'all';

  const handleCreateClass = () => {
    navigate('/classes/new');
  };

  const handleEditClass = (classItem: any) => {
    navigate(`/classes/edit/${classItem.id}`);
  };

  const handleEditFromDetails = (classItem: any) => {
    setSelectedClass(null);
    setShowClassDetails(false);
    navigate(`/classes/edit/${classItem.id}`);
  };

  return (
    <div className="space-y-6">
      <ClassHeader onAddClass={handleCreateClass} />

      <ClassFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        subjectFilter={subjectFilter}
        onSearchChange={(value) => setSearchTerm(value)}
        onStatusFilterChange={(value) => setStatusFilter(value as "all" | "active" | "inactive" | "pending")}
        onSubjectFilterChange={(value) => setSubjectFilter(value as "all" | "English" | "German")}
      />

      {filteredClasses.length === 0 ? (
        <ClassEmptyState
          hasFilters={hasFilters}
          onCreateClass={handleCreateClass}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onView={handleViewDetails}
              onEdit={handleEditClass}
              onDelete={(classItem) => {
                setClassToDelete(classItem);
              }}
            />
          ))}
        </div>
      )}

      <ClassDetails
        classItem={selectedClass}
        open={showClassDetails}
        onOpenChange={(open: boolean) => setShowClassDetails(open)}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
      />

      <ConfirmDialog
        open={classToDelete !== null}
        onOpenChange={() => setClassToDelete(null)}
        title="Delete Class"
        description={`Are you sure you want to delete ${classToDelete?.name}? This action cannot be undone.`}
        onConfirm={confirmDeleteClass}
      />
    </div>
  );
};

export default ClassManagement;
