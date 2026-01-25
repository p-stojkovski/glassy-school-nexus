import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Star, Play } from 'lucide-react';
import { SettingsTable, type SettingsTableColumn } from '../../_shared/components';
import { AcademicYearForm } from '../forms/AcademicYearForm';
import { DateRangeDisplay } from './shared/DateRangeDisplay';
import { useAcademicYears } from '../hooks';
import type { AcademicYear } from '../../types/academicCalendarTypes';
import type { AcademicYearFormData } from '../schemas/academicCalendarSchemas';

export const AcademicYearsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    academicYears,
    loading,
    fetchAcademicYears,
    createAcademicYear,
    activateAcademicYear,
  } = useAcademicYears();

  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

  const handleAddAcademicYear = () => {
    setSelectedAcademicYear(null);
    setIsFormOpen(true);
  };

  const handleActivateAcademicYear = async (academicYear: AcademicYear) => {
    if (academicYear.isActive) return;
    await activateAcademicYear(academicYear);
  };

  const handleRowClick = (year: AcademicYear) => {
    navigate(`/settings/academic-calendar/years/${year.id}`);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedAcademicYear(null);
  };

  const handleSubmit = async (data: AcademicYearFormData) => {
    const success = await createAcademicYear(data);
    if (success) {
      handleCloseForm();
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
      render: (_: unknown, row: AcademicYear) => (
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
      render: (_: unknown, row: AcademicYear) => (
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
      render: (_: unknown, row: AcademicYear) => (
        !row.isActive ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleActivateAcademicYear(row);
            }}
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
        columns={columns}
        data={academicYears}
        onAdd={handleAddAcademicYear}
        onRowClick={handleRowClick}
        addButtonText="Add Academic Year"
        emptyStateTitle="No Academic Years Found"
        emptyStateDescription="Start by adding your first academic year to the system."
        isLoading={loading.fetching}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search academic years by name..."
        searchKeys={['name']}
        hideHeader={true}
        hideActionsColumn={true}
        showNavigationArrow={true}
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
              isLoading={loading.creating}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AcademicYearsManagement;
