import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Star, Play } from 'lucide-react';
import SettingsTable, { SettingsTableColumn } from '../shared/SettingsTable';
import AcademicYearForm from './forms/AcademicYearForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DateRangeDisplay from './shared/DateRangeDisplay';
import academicCalendarApiService from '../../services/academicCalendarApi';
import { clearAcademicYearsCache } from '@/hooks/useAcademicYears';
import { clearSemestersCache } from '@/hooks/useSemesters';
import { AcademicYear, AcademicYearFormData } from '../../types/academicCalendarTypes';
import { toast } from 'sonner';

const AcademicYearsManagement: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
  const [academicYearToDelete, setAcademicYearToDelete] = useState<AcademicYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      setLoading(true);
      
      
      
      const data = await academicCalendarApiService.getAllAcademicYears();
      // Sort with active year first, then by start date descending
      const sortedData = data.sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      });
      setAcademicYears(sortedData);
    } catch (error: any) {
      toast.error('Failed to load academic years: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
      
      
    }
  };

  const handleAddAcademicYear = () => {
    setSelectedAcademicYear(null);
    setIsFormOpen(true);
  };

  const handleEditAcademicYear = (academicYear: AcademicYear) => {
    setSelectedAcademicYear(academicYear);
    setIsFormOpen(true);
  };

  const handleDeleteAcademicYear = (academicYear: AcademicYear) => {
    setAcademicYearToDelete(academicYear);
    setIsConfirmOpen(true);
  };

  const handleActivateAcademicYear = async (academicYear: AcademicYear) => {
    if (academicYear.isActive) return; // Already active

    try {
      
      
      
      await academicCalendarApiService.activateAcademicYear(academicYear.id);
      toast.success(`${academicYear.name} has been set as the active academic year`);
      clearAcademicYearsCache();
      loadAcademicYears();
    } catch (error: any) {
      toast.error('Failed to activate academic year: ' + (error.message || 'Unknown error'));
    } finally {
      
      
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedAcademicYear(null);
  };

  const handleSubmit = async (data: AcademicYearFormData) => {
    try {
      
      
      
      if (selectedAcademicYear) {
        await academicCalendarApiService.updateAcademicYear(selectedAcademicYear.id, {
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive,
        });
        toast.success('Academic year updated successfully');
        clearAcademicYearsCache();
      } else {
        await academicCalendarApiService.createAcademicYear({
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive,
        });
        toast.success('Academic year created successfully');
        clearAcademicYearsCache();
      }
      handleCloseForm();
      loadAcademicYears();
    } catch (error: any) {
      if (error.status === 409) {
        toast.error('Academic year with this name already exists or overlaps with another year');
      } else if (error.status === 400) {
        toast.error('Validation error: Please check your dates and try again');
      } else {
        toast.error('Failed to save academic year: ' + (error.message || 'Unknown error'));
      }
    } finally {
      
      
    }
  };

  const confirmDeleteAcademicYear = async () => {
    if (!academicYearToDelete) return;

    try {
      
      
      
      await academicCalendarApiService.deleteAcademicYear(academicYearToDelete.id);
      // Invalidate semesters cache for this year
      clearSemestersCache(academicYearToDelete.id);
      toast.success('Academic year deleted successfully');
      clearAcademicYearsCache();
      loadAcademicYears();
    } catch (error: any) {
      if (error.status === 409) {
        toast.error('Cannot delete academic year: it has associated semesters, breaks, or holidays');
      } else {
        toast.error('Failed to delete academic year: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setAcademicYearToDelete(null);
      setIsConfirmOpen(false);
      
      
    }
  };

  // Define columns for the academic years table
  const columns: SettingsTableColumn[] = [
    {
      key: 'name',
      label: 'Academic Year',
      width: '25%',
      render: (name: string, row: AcademicYear) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{name}</span>
          {row.isActive && (
            <Badge 
              variant="outline" 
              className="bg-green-500/20 text-green-300 border-green-500/30 text-xs"
            >
              <Star className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      width: '30%',
      render: (_, row: AcademicYear) => (
        <DateRangeDisplay 
          startDate={row.startDate} 
          endDate={row.endDate}
          showDuration={true}
        />
      ),
    },
    {
      key: 'semesterCount',
      label: 'Semesters',
      width: '15%',
      render: (count: number) => (
        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          {count || 0} Semester{(count || 0) !== 1 ? 's' : ''}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (_, row: AcademicYear) => (
        <div className="flex items-center gap-2">
          <Badge 
            variant={row.isActive ? 'default' : 'secondary'} 
            className={row.isActive 
              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
              : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
            }
          >
            {row.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'quickActions',
      label: 'Quick Actions',
      width: '15%',
      render: (_, row: AcademicYear) => (
        !row.isActive ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleActivateAcademicYear(row)}
            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 h-8 px-3 text-xs"
          >
            <Play className="w-3 h-3 mr-1" />
            Activate
          </Button>
        ) : (
          <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs px-2 py-1">
            Current
          </Badge>
        )
      ),
    },
  ];

  return (
    <>
      <SettingsTable
        title="Academic Years"
        description="Manage academic years and set the active year for the school calendar"
        columns={columns}
        data={academicYears}
        onAdd={handleAddAcademicYear}
        onEdit={handleEditAcademicYear}
        onDelete={handleDeleteAcademicYear}
        addButtonText="Add Academic Year"
        emptyStateTitle="No Academic Years Found"
        emptyStateDescription="Start by adding your first academic year to the system."
        isLoading={loading}
      />

      {/* Academic Year Form Sidebar */}
      <Sheet open={isFormOpen} onOpenChange={handleCloseForm}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto glass-scrollbar"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              {selectedAcademicYear ? 'Edit Academic Year' : 'Add New Academic Year'}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <AcademicYearForm
              academicYear={selectedAcademicYear}
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
        onConfirm={confirmDeleteAcademicYear}
        title="Delete Academic Year"
        description={
          academicYearToDelete
            ? `Are you sure you want to delete "${academicYearToDelete.name}"? This action cannot be undone and will also delete all associated semesters, teaching breaks, and holidays.`
            : 'Are you sure you want to delete this academic year?'
        }
      />
    </>
  );
};

export default AcademicYearsManagement;

