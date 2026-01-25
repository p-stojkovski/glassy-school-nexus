import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SettingsTable, type SettingsTableColumn } from '../../../_shared/components';
import { TeachingBreakForm } from '../../forms/TeachingBreakForm';
import { ConfirmDialog } from '@/components/common/dialogs';
import { DateRangeDisplay } from '../../components/shared/DateRangeDisplay';
import { useTeachingBreaks } from '../../hooks';
import type { TeachingBreak, BreakType } from '../../../types/academicCalendarTypes';
import { breakTypeLabels, breakTypeColors } from '../../../types/academicCalendarTypes';
import type { TeachingBreakFormData } from '../../schemas/academicCalendarSchemas';

interface TeachingBreaksSectionProps {
  yearId: string;
  breaks: TeachingBreak[];
  loading?: boolean;
  onMutation: () => Promise<void>;
}

export const TeachingBreaksSection: React.FC<TeachingBreaksSectionProps> = ({
  yearId,
  breaks,
  loading = false,
  onMutation,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTeachingBreak, setSelectedTeachingBreak] = useState<TeachingBreak | null>(null);
  const [teachingBreakToDelete, setTeachingBreakToDelete] = useState<TeachingBreak | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    loading: operationLoading,
    createTeachingBreak,
    updateTeachingBreak,
    deleteTeachingBreak,
  } = useTeachingBreaks(yearId);

  const handleAddTeachingBreak = () => {
    setSelectedTeachingBreak(null);
    setIsFormOpen(true);
  };

  const handleEditTeachingBreak = (teachingBreak: TeachingBreak) => {
    setSelectedTeachingBreak(teachingBreak);
    setIsFormOpen(true);
  };

  const handleDeleteTeachingBreak = (teachingBreak: TeachingBreak) => {
    setTeachingBreakToDelete(teachingBreak);
    setIsConfirmOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTeachingBreak(null);
  };

  const handleSubmit = async (data: TeachingBreakFormData) => {
    let success: boolean;
    if (selectedTeachingBreak) {
      success = await updateTeachingBreak(selectedTeachingBreak.id, data);
    } else {
      success = await createTeachingBreak(data);
    }
    if (success) {
      handleCloseForm();
      await onMutation();
    }
  };

  const confirmDeleteTeachingBreak = async () => {
    if (!teachingBreakToDelete) return;
    const success = await deleteTeachingBreak(teachingBreakToDelete.id);
    if (success) {
      setTeachingBreakToDelete(null);
      setIsConfirmOpen(false);
      await onMutation();
    }
  };

  // Define columns for the teaching breaks table
  const columns: SettingsTableColumn[] = [
    {
      key: 'name',
      label: 'Break Name',
      width: '30%',
      render: (name: string, row: TeachingBreak) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{name}</span>
          {row.notes && (
            <span className="text-white/60 text-xs truncate max-w-xs">
              {row.notes}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'breakType',
      label: 'Type',
      width: '20%',
      render: (breakType: BreakType) => (
        <Badge
          variant="outline"
          className={breakTypeColors[breakType]}
        >
          {breakTypeLabels[breakType]}
        </Badge>
      ),
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      width: '35%',
      render: (_: unknown, row: TeachingBreak) => (
        <DateRangeDisplay
          startDate={row.startDate}
          endDate={row.endDate}
          showDuration={true}
        />
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      width: '15%',
      render: (_: unknown, row: TeachingBreak) => {
        const startDate = new Date(row.startDate);
        const endDate = new Date(row.endDate);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        return (
          <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-500/30">
            {days} day{days !== 1 ? 's' : ''}
          </Badge>
        );
      },
    },
  ];

  return (
    <>
      <SettingsTable
        title="Teaching Breaks"
        description="Manage teaching breaks and non-instructional periods for this academic year"
        columns={columns}
        data={breaks}
        onAdd={handleAddTeachingBreak}
        onEdit={handleEditTeachingBreak}
        onDelete={handleDeleteTeachingBreak}
        addButtonText="Add Teaching Break"
        emptyStateTitle="No Teaching Breaks Found"
        emptyStateDescription="Start by adding the first teaching break for this academic year."
        isLoading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search teaching breaks by name..."
        searchKeys={['name', 'notes']}
      />

      {/* Teaching Break Form Sidebar */}
      <Sheet open={isFormOpen} onOpenChange={handleCloseForm}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto glass-scrollbar"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              {selectedTeachingBreak ? 'Edit Teaching Break' : 'Add New Teaching Break'}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <TeachingBreakForm
              teachingBreak={selectedTeachingBreak}
              academicYearId={yearId}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              isLoading={operationLoading.creating || operationLoading.updating}
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
        title="Delete Teaching Break"
        description={
          teachingBreakToDelete
            ? `Are you sure you want to delete "${teachingBreakToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this teaching break?'
        }
        confirmText="Delete"
        onConfirm={confirmDeleteTeachingBreak}
        isLoading={operationLoading.deleting}
      />
    </>
  );
};

export default TeachingBreaksSection;
