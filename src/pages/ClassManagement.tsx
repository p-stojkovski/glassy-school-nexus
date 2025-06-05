
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Dialog, DialogContent } from '../components/ui/dialog';
import ClassHeader from '../components/classes/ClassHeader';
import ClassFilters from '../components/classes/ClassFilters';
import ClassCard from '../components/classes/ClassCard';
import ClassForm from '../components/classes/ClassForm';
import ClassEmptyState from '../components/classes/ClassEmptyState';
import ClassLoading from '../components/classes/ClassLoading';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useClassManagement } from '../hooks/useClassManagement';

const ClassManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { classes, loading } = useSelector((state: RootState) => state.classes);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'English' | 'Mathematics' | 'Physics'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showOnlyWithAvailableSlots, setShowOnlyWithAvailableSlots] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any>(null);

  const {
    handleCreateClass,
    handleUpdateClass,
    handleDeleteClass,
    filteredClasses
  } = useClassManagement({
    searchTerm,
    subjectFilter,
    levelFilter,
    statusFilter,
    showOnlyWithAvailableSlots
  });

  const handleEdit = (classItem: any) => {
    setEditingClass(classItem);
    setShowForm(true);
  };

  const handleDelete = (classItem: any) => {
    setClassToDelete(classItem);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (classToDelete) {
      await handleDeleteClass(classToDelete.id);
      setShowDeleteDialog(false);
      setClassToDelete(null);
    }
  };

  const handleSubmit = async (data: any) => {
    if (editingClass) {
      await handleUpdateClass(editingClass.id, data);
    } else {
      await handleCreateClass(data);
    }
    setShowForm(false);
    setEditingClass(null);
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

  return (
    <div className="space-y-6">
      <ClassHeader onCreateClass={() => setShowForm(true)} />

      <ClassFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        subjectFilter={subjectFilter}
        levelFilter={levelFilter}
        statusFilter={statusFilter}
        showOnlyWithAvailableSlots={showOnlyWithAvailableSlots}
        onFilterChange={handleFilterChange}
      />

      {filteredClasses.length === 0 ? (
        <ClassEmptyState onCreateClass={() => setShowForm(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-white/20">
          <ClassForm
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingClass(null);
            }}
            initialData={editingClass}
          />
        </DialogContent>
      </Dialog>

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

export default ClassManagement;
