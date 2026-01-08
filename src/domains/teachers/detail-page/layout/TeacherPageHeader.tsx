import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, BookOpen, Calendar, Users, Edit2, Trash2, MoreVertical, Info } from 'lucide-react';
import { AppBreadcrumb } from '@/components/navigation';
import { buildTeacherBreadcrumbs } from '@/domains/teachers/_shared/utils/teacherBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Teacher } from '@/domains/teachers/teachersSlice';
import { deleteTeacher } from '@/services/teacherApiService';
import { toast } from '@/hooks/use-toast';
import { AcademicYear } from '@/domains/settings/types/academicCalendarTypes';
import AcademicYearSelector from './AcademicYearSelector';

interface TeacherPageHeaderProps {
  teacher: Teacher | null;
  onEdit: () => void;
  onUpdate?: () => void;
  selectedYear?: AcademicYear | null;
  years?: AcademicYear[];
  onYearChange?: (yearId: string) => void;
  isBetweenYears?: boolean;
  betweenYearsMessage?: string | null;
  yearsLoading?: boolean;
  studentsCount?: number;
  studentsLoading?: boolean;
}

const TeacherPageHeader: React.FC<TeacherPageHeaderProps> = ({
  teacher,
  onEdit,
  onUpdate,
  selectedYear,
  years = [],
  onYearChange,
  isBetweenYears = false,
  betweenYearsMessage,
  yearsLoading = false,
  studentsCount,
  studentsLoading = false,
}) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!teacher) {
    return null;
  }

  // Check if delete is allowed (no assigned classes)
  const hasClasses = teacher.classCount > 0;
  const canDelete = !hasClasses;

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTeacher(teacher.id);
      toast({
        title: 'Teacher deleted',
        description: `${teacher.name} has been deleted successfully.`,
      });
      setShowDeleteDialog(false);
      navigate('/teachers');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete teacher. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Format join date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="space-y-3">
        {/* Breadcrumb Navigation */}
        <AppBreadcrumb
          items={buildTeacherBreadcrumbs({
            teacherData: teacher ? { id: parseInt(teacher.id) || 0, name: teacher.name } : null,
            pageType: 'details',
          })}
        />

        {/* Unified Header Strip - Compact single bar */}
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">

            {/* Left: Subject Badge + Status */}
            <div className="flex items-center gap-2 min-w-0">
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border">
                {teacher.subjectName}
              </Badge>
              {!teacher.isActive && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded">
                  Inactive
                </span>
              )}
            </div>

            {/* Separator */}
            <span className="hidden lg:block text-white/20">|</span>

            {/* Center: Primary metadata */}
            <div className="flex flex-wrap items-center gap-3 flex-1 text-sm text-white/70">
              {/* Email */}
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-white/50" />
                <span className="truncate max-w-[200px]">{teacher.email}</span>
              </div>

              <span className="text-white/20">|</span>

              {/* Phone */}
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-white/50" />
                <span>{teacher.phone || 'No phone'}</span>
              </div>

              <span className="text-white/20">|</span>

              {/* Subject */}
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-white/50" />
                <span className="text-white/40">Subject:</span>
                <span>{teacher.subjectName}</span>
              </div>

              <span className="text-white/20">|</span>

              {/* Join Date */}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-white/50" />
                <span className="text-white/40">Joined:</span>
                <span>{formatDate(teacher.joinDate)}</span>
              </div>

              <span className="text-white/20">|</span>

              {/* Classes */}
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-white/50" />
                <span className="text-white/40">Classes:</span>
                <span>{teacher.classCount}</span>
              </div>

              <span className="text-white/20">|</span>

              {/* Students */}
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-white/50" />
                <span className="text-white/40">Students:</span>
                <span>{studentsLoading ? '--' : (studentsCount ?? '--')}</span>
              </div>
            </div>

            {/* Right: Academic Year Selector + Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Academic Year Selector */}
              {selectedYear && onYearChange && (
                <AcademicYearSelector
                  selectedYear={selectedYear}
                  years={years}
                  onYearChange={onYearChange}
                  isBetweenYears={isBetweenYears}
                  betweenYearsMessage={betweenYearsMessage}
                  isLoading={yearsLoading}
                />
              )}

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
                    onClick={onEdit}
                    className="gap-2.5 cursor-pointer text-white hover:text-white focus:text-white focus:bg-white/10 rounded-lg px-3 py-2.5 transition-all duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="font-medium">Edit Teacher</span>
                  </DropdownMenuItem>

                  {/* Delete Option */}
                  {canDelete ? (
                    <DropdownMenuItem
                      onClick={handleDeleteClick}
                      className="gap-2.5 text-rose-400 hover:text-rose-300 focus:text-rose-300 focus:bg-rose-500/10 cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="font-medium">Delete Teacher</span>
                    </DropdownMenuItem>
                  ) : (
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <div>
                            <DropdownMenuItem disabled className="gap-2.5 rounded-lg px-3 py-2.5 text-white/40">
                              <Trash2 className="w-4 h-4" />
                              <span className="font-medium">Delete Teacher</span>
                            </DropdownMenuItem>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          align="center"
                          className="z-[100] bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white max-w-xs shadow-2xl rounded-xl p-3"
                          sideOffset={8}
                        >
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-amber-400 mb-1">Cannot delete this teacher</p>
                              <p className="text-white/80 text-sm">
                                Reassign their {teacher.classCount} class{teacher.classCount > 1 ? 'es' : ''} first.
                              </p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Teacher"
        description={`Are you sure you want to delete "${teacher.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Teacher'}
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default TeacherPageHeader;
