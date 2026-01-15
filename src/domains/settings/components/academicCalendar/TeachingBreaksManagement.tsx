import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import SettingsTable, { SettingsTableColumn } from '../shared/SettingsTable';
import TeachingBreakForm from './forms/TeachingBreakForm';
import { ConfirmDialog } from '@/components/common/dialogs';
import DateRangeDisplay from './shared/DateRangeDisplay';
import YearsDropdown from '@/components/common/YearsDropdown';
import academicCalendarApiService from '../../services/academicCalendarApi';
import { 
  AcademicYear, 
  TeachingBreak, 
  TeachingBreakFormData,
  breakTypeLabels,
  breakTypeColors,
  BreakType,
} from '../../types/academicCalendarTypes';
import { toast } from 'sonner';

const TeachingBreaksManagement: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTeachingBreak, setSelectedTeachingBreak] = useState<TeachingBreak | null>(null);
  const [teachingBreakToDelete, setTeachingBreakToDelete] = useState<TeachingBreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [teachingBreaks, setTeachingBreaks] = useState<TeachingBreak[]>([]);

  useEffect(() => {
    if (selectedYearId) {
      loadTeachingBreaks();
    } else {
      setTeachingBreaks([]);
      setLoading(false);
    }
  }, [selectedYearId]);

  const loadTeachingBreaks = async () => {
    if (!selectedYearId) return;

    try {
      setLoading(true);
      
      
      
      const data = await academicCalendarApiService.getTeachingBreaksByYear(selectedYearId);
      // Sort by start date
      const sortedData = data.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      setTeachingBreaks(sortedData);
    } catch (error: any) {
      toast.error('Failed to load teaching breaks: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
      
      
    }
  };

  const handleYearChange = (yearId: string) => {
    setSelectedYearId(yearId);
  };

  const handleAddTeachingBreak = () => {
    if (!selectedYearId) {
      toast.error('Please select an academic year first');
      return;
    }
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
    if (!selectedYearId) {
      toast.error('Please select an academic year first');
      return;
    }

    try {
      
      
      
      if (selectedTeachingBreak) {
        await academicCalendarApiService.updateTeachingBreak(selectedTeachingBreak.id, {
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          breakType: data.breakType,
          notes: data.notes,
        });
        toast.success('Teaching break updated successfully');
      } else {
        await academicCalendarApiService.createTeachingBreak(selectedYearId, {
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          breakType: data.breakType,
          notes: data.notes,
        });
        toast.success('Teaching break created successfully');
      }
      handleCloseForm();
      loadTeachingBreaks();
    } catch (error: any) {
      if (error.status === 400) {
        toast.error('Validation error: Please check dates are within the academic year and do not overlap with other breaks');
      } else if (error.status === 404) {
        toast.error('Academic year not found. Please select a valid academic year.');
      } else {
        toast.error('Failed to save teaching break: ' + (error.message || 'Unknown error'));
      }
    } finally {
      
      
    }
  };

  const confirmDeleteTeachingBreak = async () => {
    if (!teachingBreakToDelete) return;

    try {
      
      
      
      await academicCalendarApiService.deleteTeachingBreak(teachingBreakToDelete.id);
      toast.success('Teaching break deleted successfully');
      loadTeachingBreaks();
    } catch (error: any) {
      toast.error('Failed to delete teaching break: ' + (error.message || 'Unknown error'));
    } finally {
      setTeachingBreakToDelete(null);
      setIsConfirmOpen(false);
      
      
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
      render: (_, row: TeachingBreak) => (
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
      render: (_, row: TeachingBreak) => {
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
      <div className="space-y-6">
        {/* Academic Year Context Selector */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Academic Year Context</h3>
              <p className="text-white/70 text-sm">Select an academic year to manage its teaching breaks</p>
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

        {/* Teaching Breaks Table */}
        <SettingsTable
          title="Teaching Breaks"
          description={
            selectedYearId 
              ? `Manage teaching breaks and non-instructional periods for the selected academic year`
              : 'Select an academic year to view and manage its teaching breaks'
          }
          columns={columns}
          data={teachingBreaks}
          onAdd={selectedYearId ? handleAddTeachingBreak : undefined}
          onEdit={handleEditTeachingBreak}
          onDelete={handleDeleteTeachingBreak}
          addButtonText="Add Teaching Break"
          emptyStateTitle={selectedYearId ? "No Teaching Breaks Found" : "Select Academic Year"}
          emptyStateDescription={
            selectedYearId 
              ? "Start by adding the first teaching break for this academic year."
              : "Choose an academic year above to view and manage its teaching breaks."
          }
          isLoading={loading}
          hideAddButton={!selectedYearId}
        />
      </div>

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
      />
    </>
  );
};

export default TeachingBreaksManagement;

