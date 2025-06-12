import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClassHeader from '../components/classes/ClassHeader';
import ClassFilters from '../components/classes/ClassFilters';
import ClassCard from '../components/classes/ClassCard';
import ClassEmptyState from '../components/classes/ClassEmptyState';
import ClassLoading from '../components/classes/ClassLoading';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DemoModeNotification from '../components/classes/DemoModeNotification';
import { useClassManagement } from '../hooks/useClassManagement';
import { Class } from '../store/slices/classesSlice';

const ClassManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'English' | 'Mathematics' | 'Physics'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showOnlyWithAvailableSlots, setShowOnlyWithAvailableSlots] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  const {
    loading,
    filteredClasses,
    handleCreateClass,
    handleUpdateClass,
    handleDeleteClass
  } = useClassManagement({
    searchTerm,
    subjectFilter,
    levelFilter,
    statusFilter,
    showOnlyWithAvailableSlots
  });

  const handleAddClass = () => {
    navigate('/classes/new');
  };

  const handleEdit = (classItem: Class) => {
    navigate(`/classes/edit/${classItem.id}`);
  };

  const handleDelete = (classItem: Class) => {
    setClassToDelete(classItem);
    setShowDeleteDialog(true);
  };

  const handleView = (classItem: Class) => {
    // Handle view functionality
  };

  const confirmDelete = async () => {
    if (classToDelete) {
      await handleDeleteClass(classToDelete.id);
      setShowDeleteDialog(false);
      setClassToDelete(null);
    }
  };

  const handleFilterChange = (type: string, value: string) => {
    switch (type) {
      case 'subject':
        if (value === 'all' || value === 'English' || value === 'Mathematics' || value === 'Physics') {
          setSubjectFilter(value);
        }
        break;
      case 'level':
        if (value === 'all' || value === 'A1' || value === 'A2' || value === 'B1' || value === 'B2' || value === 'C1' || value === 'C2') {
          setLevelFilter(value);
        }
        break;
      case 'status':
        if (value === 'all' || value === 'active' || value === 'inactive') {
          setStatusFilter(value);
        }
        break;
      case 'availableSlots':
        setShowOnlyWithAvailableSlots(value === 'true');
        break;
    }
  };

  if (loading) {
    return <ClassLoading />;
  }

  const hasFilters = searchTerm !== '' || subjectFilter !== 'all' || levelFilter !== 'all' || statusFilter !== 'all' || showOnlyWithAvailableSlots;

  return (
    <div className="space-y-6">
      <DemoModeNotification />
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

      {/* <DemoModeNotification /> */}
    </div>
  );
};

export default ClassManagement;
