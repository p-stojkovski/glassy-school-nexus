import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, MoreVertical, Play, Star } from 'lucide-react';
import { AppBreadcrumb } from '@/components/navigation';
import { buildAcademicYearBreadcrumbs } from '../utils/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ConfirmDialog } from '@/components/common/dialogs';
import { DateRangeDisplay } from '../../components/shared/DateRangeDisplay';
import { AcademicYearForm } from '../../forms/AcademicYearForm';
import { useAcademicYears } from '../../hooks';
import type { AcademicYear } from '../../../types/academicCalendarTypes';
import type { AcademicYearFormData } from '../../schemas/academicCalendarSchemas';

interface AcademicYearPageHeaderProps {
  yearData: AcademicYear;
  onUpdate: () => Promise<void>;
}

const AcademicYearPageHeader: React.FC<AcademicYearPageHeaderProps> = ({
  yearData,
  onUpdate,
}) => {
  const navigate = useNavigate();
  const { updateAcademicYear, deleteAcademicYear, activateAcademicYear, loading } = useAcademicYears();

  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const handleEditSubmit = async (data: AcademicYearFormData) => {
    const success = await updateAcademicYear(yearData.id, data);
    if (success) {
      setShowEditSheet(false);
      await onUpdate();
    }
  };

  const handleDelete = async () => {
    const success = await deleteAcademicYear(yearData.id);
    if (success) {
      setShowDeleteDialog(false);
      navigate('/settings?tab=academic-calendar');
    }
  };

  const handleActivate = async () => {
    if (yearData.isActive) return;
    setIsActivating(true);
    try {
      const success = await activateAcademicYear(yearData);
      if (success) {
        await onUpdate();
      }
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {/* Breadcrumb Navigation */}
        <AppBreadcrumb
          items={buildAcademicYearBreadcrumbs({
            yearData: { id: yearData.id, name: yearData.name },
            pageType: 'details',
          })}
        />

        {/* Header Strip */}
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Left: Active badge if active */}
            {yearData.isActive && (
              <div className="flex items-center gap-2 min-w-0">
                <Badge
                  variant="outline"
                  className="bg-green-500/20 text-green-300 border-green-500/30 text-xs"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Active
                </Badge>
                <span className="text-white/20">|</span>
              </div>
            )}

            {/* Center: Metadata (date range, duration) */}
            <div className="flex flex-wrap items-center gap-3 flex-1 text-sm text-white/70">
              {/* Date Range with Duration */}
              <DateRangeDisplay
                startDate={yearData.startDate}
                endDate={yearData.endDate}
                showDuration={true}
              />

              {/* Semester Count if available */}
              {yearData.semesterCount !== undefined && yearData.semesterCount > 0 && (
                <>
                  <span className="text-white/20">|</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/40">Semesters:</span>
                    <span>{yearData.semesterCount}</span>
                  </div>
                </>
              )}
            </div>

            {/* Right: Actions dropdown */}
            <div className="flex items-center shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl p-1.5"
                >
                  {/* Edit Option */}
                  <DropdownMenuItem
                    onClick={() => setShowEditSheet(true)}
                    className="gap-2.5 cursor-pointer text-white hover:text-white focus:text-white focus:bg-white/10 rounded-lg px-3 py-2.5 transition-all duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="font-medium">Edit Year</span>
                  </DropdownMenuItem>

                  {/* Activate Option - only show if not active */}
                  {!yearData.isActive && (
                    <DropdownMenuItem
                      onClick={handleActivate}
                      disabled={isActivating}
                      className="gap-2.5 cursor-pointer text-yellow-400 hover:text-yellow-300 focus:text-yellow-300 focus:bg-yellow-500/10 rounded-lg px-3 py-2.5 transition-all duration-200"
                    >
                      <Play className="w-4 h-4" />
                      <span className="font-medium">
                        {isActivating ? 'Activating...' : 'Activate Year'}
                      </span>
                    </DropdownMenuItem>
                  )}

                  {/* Delete Option */}
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="gap-2.5 text-rose-400 hover:text-rose-300 focus:text-rose-300 focus:bg-rose-500/10 cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="font-medium">Delete Year</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Sheet */}
      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto glass-scrollbar"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              Edit Academic Year
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <AcademicYearForm
              academicYear={yearData}
              onSubmit={handleEditSubmit}
              onCancel={() => setShowEditSheet(false)}
              isLoading={loading.updating}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        intent="danger"
        icon={Trash2}
        title="Delete Academic Year"
        description={`Are you sure you want to delete "${yearData.name}"? This action cannot be undone and will also delete all associated semesters, teaching breaks, and holidays.`}
        confirmText="Delete Year"
        cancelText="Cancel"
        onConfirm={handleDelete}
        isLoading={loading.deleting}
      />
    </>
  );
};

export default AcademicYearPageHeader;
