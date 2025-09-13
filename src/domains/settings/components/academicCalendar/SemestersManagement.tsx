import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import SettingsTable, { SettingsTableColumn } from '../shared/SettingsTable';
import SemesterForm from './forms/SemesterForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DateRangeDisplay from './shared/DateRangeDisplay';
import YearsDropdown from '@/components/common/YearsDropdown';
import academicCalendarApiService from '../../services/academicCalendarApi';
import { clearSemestersCache } from '@/hooks/useSemesters';
import { 
  AcademicYear, 
  Semester, 
  SemesterFormData 
} from '../../types/academicCalendarTypes';
import { toast } from 'sonner';

const SemestersManagement: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [semesters, setSemesters] = useState<Semester[]>([]);

  useEffect(() => {
    if (selectedYearId) {
      loadSemesters();
    } else {
      setSemesters([]);
      setLoading(false);
    }
  }, [selectedYearId]);

  const loadSemesters = async () => {
    if (!selectedYearId) return;

    try {
      setLoading(true);
      
      
      
      const data = await academicCalendarApiService.getSemestersByYear(selectedYearId);
      // Sort by semester number
      const sortedData = data.sort((a, b) => a.semesterNumber - b.semesterNumber);
      setSemesters(sortedData);
    } catch (error: any) {
      toast.error('Failed to load semesters: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
      
      
    }
  };

  const handleYearChange = (yearId: string) => {
    setSelectedYearId(yearId);
  };

  const handleAddSemester = () => {
    if (!selectedYearId) {
      toast.error('Please select an academic year first');
      return;
    }
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
    if (!selectedYearId) {
      toast.error('Please select an academic year first');
      return;
    }

    try {
      
      
      
      if (selectedSemester) {
        await academicCalendarApiService.updateSemester(selectedSemester.id, {
          name: data.name,
          semesterNumber: data.semesterNumber,
          startDate: data.startDate,
          endDate: data.endDate,
        });
        toast.success('Semester updated successfully');
        clearSemestersCache(selectedYearId);
      } else {
        await academicCalendarApiService.createSemester(selectedYearId, {
          name: data.name,
          semesterNumber: data.semesterNumber,
          startDate: data.startDate,
          endDate: data.endDate,
        });
        toast.success('Semester created successfully');
        clearSemestersCache(selectedYearId);
      }
      handleCloseForm();
      loadSemesters();
    } catch (error: any) {
      if (error.status === 400) {
        toast.error('Validation error: Please check dates are within the academic year and do not overlap');
      } else if (error.status === 404) {
        toast.error('Academic year not found. Please select a valid academic year.');
      } else {
        toast.error('Failed to save semester: ' + (error.message || 'Unknown error'));
      }
    } finally {
      
      
    }
  };

  const confirmDeleteSemester = async () => {
    if (!semesterToDelete) return;

    try {
      
      
      
      await academicCalendarApiService.deleteSemester(semesterToDelete.id);
      toast.success('Semester deleted successfully');
      if (selectedYearId) clearSemestersCache(selectedYearId);
      loadSemesters();
    } catch (error: any) {
      toast.error('Failed to delete semester: ' + (error.message || 'Unknown error'));
    } finally {
      setSemesterToDelete(null);
      setIsConfirmOpen(false);
      
      
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
      render: (_, row: Semester) => (
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
      <div className="space-y-6">
        {/* Academic Year Context Selector */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Academic Year Context</h3>
              <p className="text-white/70 text-sm">Select an academic year to manage its semesters</p>
            </div>
            <div className="sm:w-80">
              <YearsDropdown
                value={selectedYearId}
                onValueChange={handleYearChange}
                placeholder="Choose academic year..."
                showActiveIndicator={true}
                onLoaded={(years) => {
                  const active = years.find(y => y.isActive);
                  if (active) setSelectedYearId(active.id);
                  else if (years.length > 0) setSelectedYearId(years[0].id);
                }}
              />
            </div>
          </div>
        </div>

        {/* Semesters Table */}
        <SettingsTable
          title="Semesters"
          description={
            selectedYearId 
              ? `Manage semesters for the selected academic year`
              : 'Select an academic year to view and manage its semesters'
          }
          columns={columns}
          data={semesters}
          onAdd={selectedYearId ? handleAddSemester : undefined}
          onEdit={handleEditSemester}
          onDelete={handleDeleteSemester}
          addButtonText="Add Semester"
          emptyStateTitle={selectedYearId ? "No Semesters Found" : "Select Academic Year"}
          emptyStateDescription={
            selectedYearId 
              ? "Start by adding the first semester for this academic year."
              : "Choose an academic year above to view and manage its semesters."
          }
          isLoading={loading}
          hideAddButton={!selectedYearId}
        />
      </div>

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
              academicYearId={selectedYearId}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmDeleteSemester}
        title="Delete Semester"
        description={
          semesterToDelete
            ? `Are you sure you want to delete "${semesterToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this semester?'
        }
      />
    </>
  );
};

export default SemestersManagement;

