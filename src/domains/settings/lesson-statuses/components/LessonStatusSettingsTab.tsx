import React, { useState, useEffect, useCallback } from 'react';
import { SettingsTable, type SettingsTableColumn } from '../../_shared/components';
import { LessonStatusFormSheet } from '../dialogs';
import { useLessonStatuses } from '../hooks/useLessonStatuses';
import type { LessonStatus } from '../../types/lessonStatusTypes';
import type { LessonStatusFormData } from '../schemas/lessonStatusSchemas';
import LessonStatusBadge from '@/domains/lessons/components/LessonStatusBadge';

export function LessonStatusSettingsTab() {
  // UI state (local)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<LessonStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Redux state via hook
  const {
    lessonStatuses,
    loading,
    fetchLessonStatuses,
    updateLessonStatus,
  } = useLessonStatuses();

  // Fetch lesson statuses on mount if empty
  useEffect(() => {
    if (lessonStatuses.length === 0) {
      fetchLessonStatuses();
    }
  }, [fetchLessonStatuses, lessonStatuses.length]);

  const handleEditStatus = useCallback((status: LessonStatus) => {
    setSelectedStatus(status);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback((open: boolean) => {
    if (!open) {
      setIsFormOpen(false);
      setSelectedStatus(null);
    }
  }, []);

  // Handle row click - opens edit sheet
  const handleRowClick = useCallback((status: LessonStatus) => {
    handleEditStatus(status);
  }, [handleEditStatus]);

  const handleSubmit = async (data: LessonStatusFormData) => {
    if (!selectedStatus) return;

    const result = await updateLessonStatus(selectedStatus.id, {
      description: data.description || null,
    });

    if (result) {
      handleCloseForm(false);
    }
  };

  const columns: SettingsTableColumn[] = [
    {
      key: 'name',
      label: 'Status Name',
      width: '30%',
      render: (name: string) => (
        <LessonStatusBadge status={name} size="md" />
      ),
    },
    {
      key: 'description',
      label: 'Description',
      width: '55%',
      render: (description: string | null) => (
        <span className={description ? 'text-white' : 'text-white/40 italic'}>
          {description || 'No description'}
        </span>
      ),
    },
  ];

  return (
    <>
      <SettingsTable
        columns={columns}
        data={lessonStatuses}
        onRowClick={handleRowClick}
        hideActionsColumn={true}
        showNavigationArrow={true}
        // Note: No onAdd - statuses are predefined
        // Note: No onDelete - statuses cannot be removed
        emptyStateTitle="No Lesson Statuses Found"
        emptyStateDescription="Lesson statuses will appear here once configured."
        isLoading={loading.fetching}
        hideAddButton={true}
        hideDeleteButton={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search lesson statuses by name..."
        searchKeys={['name', 'description']}
      />

      {/* Lesson Status Form Sheet */}
      <LessonStatusFormSheet
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        lessonStatus={selectedStatus}
        onSubmit={handleSubmit}
        isLoading={loading.updating}
      />
    </>
  );
}

export default LessonStatusSettingsTab;
