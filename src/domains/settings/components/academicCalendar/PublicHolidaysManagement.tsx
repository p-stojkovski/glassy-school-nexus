import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import SettingsTable, { SettingsTableColumn } from '../shared/SettingsTable';
import PublicHolidayForm from './forms/PublicHolidayForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import YearsDropdown from '@/components/common/YearsDropdown';
import academicCalendarApiService from '../../services/academicCalendarApi';
import { 
  AcademicYear, 
  PublicHoliday, 
  PublicHolidayFormData,
} from '../../types/academicCalendarTypes';
import { toast } from 'sonner';

const PublicHolidaysManagement: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPublicHoliday, setSelectedPublicHoliday] = useState<PublicHoliday | null>(null);
  const [publicHolidayToDelete, setPublicHolidayToDelete] = useState<PublicHoliday | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>([]);

  useEffect(() => {
    if (selectedYearId) {
      loadPublicHolidays();
    } else {
      setPublicHolidays([]);
      setLoading(false);
    }
  }, [selectedYearId]);

  const loadPublicHolidays = async () => {
    if (!selectedYearId) return;

    try {
      setLoading(true);
      
      
      
      const data = await academicCalendarApiService.getPublicHolidaysByYear(selectedYearId);
      // Sort by date
      const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setPublicHolidays(sortedData);
    } catch (error: any) {
      toast.error('Failed to load public holidays: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
      
      
    }
  };

  const handleYearChange = (yearId: string) => {
    setSelectedYearId(yearId);
  };

  const handleAddPublicHoliday = () => {
    if (!selectedYearId) {
      toast.error('Please select an academic year first');
      return;
    }
    setSelectedPublicHoliday(null);
    setIsFormOpen(true);
  };

  const handleEditPublicHoliday = (publicHoliday: PublicHoliday) => {
    setSelectedPublicHoliday(publicHoliday);
    setIsFormOpen(true);
  };

  const handleDeletePublicHoliday = (publicHoliday: PublicHoliday) => {
    setPublicHolidayToDelete(publicHoliday);
    setIsConfirmOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedPublicHoliday(null);
  };

  const handleSubmit = async (data: PublicHolidayFormData) => {
    if (!selectedYearId) {
      toast.error('Please select an academic year first');
      return;
    }

    try {
      
      
      
      if (selectedPublicHoliday) {
        await academicCalendarApiService.updatePublicHoliday(selectedPublicHoliday.id, {
          name: data.name,
          date: data.date,
          recurringAnnually: data.recurringAnnually,
        });
        toast.success('Public holiday updated successfully');
      } else {
        await academicCalendarApiService.createPublicHoliday(selectedYearId, {
          name: data.name,
          date: data.date,
          recurringAnnually: data.recurringAnnually,
        });
        toast.success('Public holiday created successfully');
      }
      handleCloseForm();
      loadPublicHolidays();
    } catch (error: any) {
      if (error.status === 400) {
        toast.error('Validation error: Please check the date and ensure it\'s not a duplicate');
      } else if (error.status === 404) {
        toast.error('Academic year not found. Please select a valid academic year.');
      } else {
        toast.error('Failed to save public holiday: ' + (error.message || 'Unknown error'));
      }
    } finally {
      
      
    }
  };

  const confirmDeletePublicHoliday = async () => {
    if (!publicHolidayToDelete) return;

    try {
      
      
      
      await academicCalendarApiService.deletePublicHoliday(publicHolidayToDelete.id);
      toast.success('Public holiday deleted successfully');
      loadPublicHolidays();
    } catch (error: any) {
      toast.error('Failed to delete public holiday: ' + (error.message || 'Unknown error'));
    } finally {
      setPublicHolidayToDelete(null);
      setIsConfirmOpen(false);
      
      
    }
  };

  // Define columns for the public holidays table
  const columns: SettingsTableColumn[] = [
    {
      key: 'name',
      label: 'Holiday Name',
      width: '35%',
      render: (name: string, row: PublicHoliday) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{name}</span>
          {row.recurringAnnually && (
            <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />
              Recurring
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      width: '25%',
      render: (date: string) => {
        try {
          const formattedDate = format(new Date(date), 'EEEE, MMM dd, yyyy');
          return (
            <div className="text-white/90">
              {formattedDate}
            </div>
          );
        } catch {
          return <span className="text-white/60">{date}</span>;
        }
      },
    },
    {
      key: 'recurringAnnually',
      label: 'Type',
      width: '20%',
      render: (recurringAnnually: boolean) => (
        <Badge 
          variant={recurringAnnually ? 'default' : 'secondary'} 
          className={recurringAnnually 
            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
            : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
          }
        >
          {recurringAnnually ? 'Annual' : 'One-time'}
        </Badge>
      ),
    },
    {
      key: 'monthDay',
      label: 'Month/Day',
      width: '20%',
      render: (_, row: PublicHoliday) => {
        try {
          const monthDay = format(new Date(row.date), 'MMM dd');
          return (
            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {monthDay}
            </Badge>
          );
        } catch {
          return <span className="text-white/60">-</span>;
        }
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
              <p className="text-white/70 text-sm">Select an academic year to manage its public holidays</p>
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

        {/* Public Holidays Table */}
        <SettingsTable
          title="Public Holidays"
          description={
            selectedYearId 
              ? `Manage public holidays for the selected academic year. Recurring holidays will apply to all years.`
              : 'Select an academic year to view and manage its public holidays'
          }
          columns={columns}
          data={publicHolidays}
          onAdd={selectedYearId ? handleAddPublicHoliday : undefined}
          onEdit={handleEditPublicHoliday}
          onDelete={handleDeletePublicHoliday}
          addButtonText="Add Public Holiday"
          emptyStateTitle={selectedYearId ? "No Public Holidays Found" : "Select Academic Year"}
          emptyStateDescription={
            selectedYearId 
              ? "Start by adding the first public holiday for this academic year."
              : "Choose an academic year above to view and manage its public holidays."
          }
          isLoading={loading}
          hideAddButton={!selectedYearId}
        />
      </div>

      {/* Public Holiday Form Sidebar */}
      <Sheet open={isFormOpen} onOpenChange={handleCloseForm}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto glass-scrollbar"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              {selectedPublicHoliday ? 'Edit Public Holiday' : 'Add New Public Holiday'}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <PublicHolidayForm
              publicHoliday={selectedPublicHoliday}
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
        onConfirm={confirmDeletePublicHoliday}
        title="Delete Public Holiday"
        description={
          publicHolidayToDelete
            ? `Are you sure you want to delete "${publicHolidayToDelete.name}"? This action cannot be undone.${
                publicHolidayToDelete.recurringAnnually 
                  ? ' This will also remove the holiday from all future academic years.' 
                  : ''
              }`
            : 'Are you sure you want to delete this public holiday?'
        }
      />
    </>
  );
};

export default PublicHolidaysManagement;

