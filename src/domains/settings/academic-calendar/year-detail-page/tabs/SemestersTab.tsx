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
import { SemesterForm } from '../../forms/SemesterForm';
import { ConfirmDialog } from '@/components/common/dialogs';
import { DateRangeDisplay } from '../../components/shared/DateRangeDisplay';
import { useSemesters } from '../../hooks';
import type { Semester } from '../../../types/academicCalendarTypes';
import type { SemesterFormData } from '../../schemas/academicCalendarSchemas';

interface SemestersTabProps {
  yearId: string;
  semesters: Semester[];
  loading?: boolean;
  onMutation: () => Promise<void>;
}

export const SemestersTab: React.FC<SemestersTabProps> = ({
  yearId,
  semesters,
  loading = false,
  onMutation,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    loading: operationLoading,
    createSemester,
    updateSemester,
    deleteSemester,
  } = useSemesters(yearId);

  const handleAddSemester = () => {
    setSelectedSemester(null);
    setIsFormOpen(true);
  };

  const handleEditSemester = (semester: Semester) => {
    setSelectedSemester(semester);
    setIsFormOpen(true);
  };

  const handleDeleteSemester = (semester: Semester) => {
    setSemesterToDelete(semester);
    setIsConfirmOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSemester(null);
  };

  const handleSubmit = async (data: SemesterFormData) => {
    let success: boolean;
    if (selectedSemester) {
      success = await updateSemester(selectedSemester.id, data);
    } else {
      success = await createSemester(data);
    }
    if (success) {
      handleCloseForm();
      await onMutation();
    }
  };

  const confirmDeleteSemester = async () => {
    if (!semesterToDelete) return;
    const success = await deleteSemester(semesterToDelete.id);
    if (success) {
      setSemesterToDelete(null);
      setIsConfirmOpen(false);
      await onMutation();
    }
  };

  // Define columns for the semesters table
  const columns: SettingsTableColumn[] = [
    {
      key: 'name',
      label: 'Semester',
      width: '25%',
      render: (name: string, row: Semester) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{name}</span>
          <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
            #{row.semesterNumber}
          </Badge>
        </div>
      ),
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      width: '35%',
      render: (_: unknown, row: Semester) => (
        <DateRangeDisplay
          startDate={row.startDate}
          endDate={row.endDate}
          showDuration={true}
        />
      ),
    },
  ];

  return (
    <>
      <SettingsTable
        columns={columns}
        data={semesters}
        onAdd={handleAddSemester}
        onEdit={handleEditSemester}
        onDelete={handleDeleteSemester}
        addButtonText="Add Semester"
        emptyStateTitle="No Semesters Found"
        emptyStateDescription="Start by adding the first semester for this academic year."
        isLoading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search semesters by name..."
        searchKeys={['name']}
      />

      {/* Semester Form Sidebar */}
      <Sheet open={isFormOpen} onOpenChange={handleCloseForm}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto glass-scrollbar"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              {selectedSemester ? 'Edit Semester' : 'Add New Semester'}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <SemesterForm
              semester={selectedSemester}
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
        title="Delete Semester"
        description={
          semesterToDelete
            ? `Are you sure you want to delete "${semesterToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this semester?'
        }
        confirmText="Delete"
        onConfirm={confirmDeleteSemester}
        isLoading={operationLoading.deleting}
      />
    </>
  );
};

export default SemestersTab;
