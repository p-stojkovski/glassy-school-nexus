import React, { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SettingsTable, type SettingsTableColumn } from '../../_shared/components';
import { SubjectFormSheet } from '../dialogs';
import { ConfirmDialog } from '@/components/common/dialogs';
import { useSubjects } from '../hooks/useSubjects';
import type { Subject } from '@/domains/settings/types/subjectTypes';
import type { SubjectFormData } from '../schemas/subjectSchemas';

export const SubjectSettingsTab: React.FC = () => {
  // UI state (local)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Redux state via hook
  const {
    subjects,
    loading,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  } = useSubjects();

  // Fetch subjects on mount if empty
  useEffect(() => {
    if (subjects.length === 0) {
      fetchSubjects();
    }
  }, [subjects.length, fetchSubjects]);

  const handleAddSubject = useCallback(() => {
    setSelectedSubject(null);
    setIsFormOpen(true);
  }, []);

  const handleEditSubject = useCallback((subject: Subject) => {
    setSelectedSubject(subject);
    setIsFormOpen(true);
  }, []);

  const handleDeleteSubject = useCallback((subject: Subject) => {
    setSubjectToDelete(subject);
    setIsConfirmOpen(true);
  }, []);

  const handleCloseForm = useCallback((open: boolean) => {
    if (!open) {
      setIsFormOpen(false);
      setSelectedSubject(null);
    }
  }, []);

  // Handle row click - opens edit sheet
  const handleRowClick = useCallback((subject: Subject) => {
    handleEditSubject(subject);
  }, [handleEditSubject]);

  // Handle delete from within the sheet
  const handleDeleteFromSheet = useCallback(() => {
    if (selectedSubject) {
      handleDeleteSubject(selectedSubject);
    }
  }, [selectedSubject, handleDeleteSubject]);

  const handleSubmit = async (data: SubjectFormData) => {
    let success: boolean;
    if (selectedSubject) {
      success = await updateSubject(selectedSubject.id, data);
    } else {
      success = await createSubject(data);
    }
    if (success) {
      handleCloseForm(false);
    }
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;

    const success = await deleteSubject(subjectToDelete.id);
    if (success) {
      setSubjectToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  // Define columns for the subject table
  const columns: SettingsTableColumn[] = [
    {
      key: 'name',
      label: 'Subject Name',
      width: '30%',
    },
    {
      key: 'key',
      label: 'Key',
      width: '20%',
      render: (key: string) => (
        <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          {key}
        </Badge>
      ),
    },
    {
      key: 'sortOrder',
      label: 'Order',
      width: '15%',
    },
    {
      key: 'isActive',
      label: 'Status',
      width: '20%',
      render: (isActive: boolean) => (
        <Badge
          variant={isActive ? 'default' : 'secondary'}
          className={isActive
            ? 'bg-green-500/20 text-green-300 border-green-500/30'
            : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
          }
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <SettingsTable
        columns={columns}
        data={subjects}
        onAdd={handleAddSubject}
        onRowClick={handleRowClick}
        hideActionsColumn={true}
        showNavigationArrow={true}
        addButtonText="Add Subject"
        emptyStateTitle="No Subjects Found"
        emptyStateDescription="Start by adding your first subject to the system."
        isLoading={loading.fetching}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search subjects by name..."
        searchKeys={['name', 'key']}
      />

      {/* Subject Form Sheet */}
      <SubjectFormSheet
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        subject={selectedSubject}
        onSubmit={handleSubmit}
        onDelete={handleDeleteFromSheet}
        isLoading={loading.creating || loading.updating}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          setIsConfirmOpen(open);
          if (!open) {
            setSubjectToDelete(null);
          }
        }}
        intent="danger"
        icon={Trash2}
        title="Delete Subject"
        description={
          subjectToDelete
            ? `Are you sure you want to delete ${subjectToDelete.name}? This action cannot be undone and may affect existing classes and teachers.`
            : 'Are you sure you want to delete this subject?'
        }
        confirmText="Delete"
        onConfirm={confirmDeleteSubject}
        isLoading={loading.deleting}
      />
    </>
  );
};

export default SubjectSettingsTab;
