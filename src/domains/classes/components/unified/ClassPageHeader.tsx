import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Edit2, Trash2, Info, MoreVertical, Archive, Play, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import { UseClassLessonContextResult } from '@/domains/classes/hooks/useClassLessonContext';
import { formatTimeRangeWithoutSeconds } from '@/utils/timeFormatUtils';
import { AppBreadcrumb } from '@/components/navigation';
import { buildClassBreadcrumbs } from '@/domains/classes/utils/classBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClassBasicInfoResponse } from '@/types/api/class';
import { EditClassInfoDialog } from '@/domains/classes/components/dialogs/EditClassInfoDialog';
import { DisableClassDialog } from '@/domains/classes/components/dialogs/DisableClassDialog';
import { EnableClassDialog } from '@/domains/classes/components/dialogs/EnableClassDialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useAppDispatch } from '@/store/hooks';
import { deleteClass } from '@/domains/classes/classesSlice';
import { toast } from '@/hooks/use-toast';

interface ClassPageHeaderProps {
  classData: ClassBasicInfoResponse | null;
  onUpdate?: () => void;
  /** Lesson context for showing next lesson info */
  lessonContext?: UseClassLessonContextResult;
  /** Handlers for lesson actions from hero */
  onStartTeaching?: (lesson: LessonResponse) => void;
  onConductLesson?: (lesson: LessonResponse) => void;
  onCancelLesson?: (lesson: LessonResponse) => void;
}

const ClassPageHeader: React.FC<ClassPageHeaderProps> = ({
  classData,
  onUpdate,
  lessonContext,
  onStartTeaching,
  onConductLesson,
  onCancelLesson,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!classData) {
    return null;
  }

  // Check if delete is allowed (no lessons and no students)
  const hasLessons = classData.lessonSummary?.totalLessons > 0;
  const hasStudents = classData.enrolledCount > 0;
  const canDelete = !hasLessons && !hasStudents;

  // Build the reason why delete is disabled
  const getDeleteDisabledReason = (): string | null => {
    if (canDelete) return null;
    const reasons: string[] = [];
    if (hasLessons) {
      reasons.push(`${classData.lessonSummary.totalLessons} lesson${classData.lessonSummary.totalLessons > 1 ? 's' : ''}`);
    }
    if (hasStudents) {
      reasons.push(`${classData.enrolledCount} student${classData.enrolledCount > 1 ? 's' : ''}`);
    }
    return `Cannot delete: class has ${reasons.join(' and ')}`;
  };

  const handleEditSuccess = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      dispatch(deleteClass(classData.id));
      toast({
        title: 'Class Deleted',
        description: `${classData.name} has been successfully deleted.`,
        variant: 'default',
      });
      setShowDeleteDialog(false);
      navigate('/classes');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete class. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Extract lesson context info
  const { currentLesson, nextLesson, lessonState } = lessonContext || {};
  const lesson = currentLesson || nextLesson;
  
  // Calculate progress
  const { lessonSummary } = classData;
  const totalLessons = lessonSummary?.totalLessons || 0;
  const conductedLessons = lessonSummary?.conductedLessons || 0;
  
  // Format lesson time
  const formatLessonTime = () => {
    if (!lesson) return null;
    return formatTimeRangeWithoutSeconds(lesson.startTime, lesson.endTime);
  };

  // Format lesson date (e.g., "Mon, Dec 1" or "Today" / "Tomorrow")
  const formatLessonDate = () => {
    if (!lesson) return null;
    const lessonDate = new Date(lesson.scheduledDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if it's today
    if (lessonDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    // Check if it's tomorrow
    if (lessonDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    // Otherwise format as "Mon, Dec 1"
    return lessonDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status indicator
  const getStatusConfig = () => {
    switch (lessonState) {
      case 'active':
        return { dot: 'bg-green-500 animate-pulse', text: 'In Progress', textColor: 'text-green-400' };
      case 'upcoming_today':
        return { dot: 'bg-blue-500', text: 'Today', textColor: 'text-blue-400' };
      case 'upcoming_future':
        return { dot: 'bg-indigo-500', text: 'Scheduled', textColor: 'text-indigo-400' };
      default:
        return null;
    }
  };
  const statusConfig = getStatusConfig();

  return (
    <>
      <div className="space-y-3">
        {/* Breadcrumb Navigation */}
        <AppBreadcrumb 
          items={buildClassBreadcrumbs({
            classData: classData ? { id: classData.id, name: classData.name } : null,
            pageType: 'details',
          })}
        />

        {/* Unified Header Strip - Compact single bar with calmer styling */}
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            
            {/* Left: Teacher Name (class name is in breadcrumb) */}
            <div className="flex items-center gap-2 min-w-0">
              <User className="w-4 h-4 text-white/50" />
              <span className="text-sm text-white truncate">
                {classData.teacherName}
              </span>
              {!classData.isActive && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded">
                  Disabled
                </span>
              )}
            </div>

            {/* Separator */}
            <span className="hidden lg:block text-white/20">|</span>

            {/* Center: Primary metadata (Year, Subject, Location, Capacity) */}
            <div className="flex flex-wrap items-center gap-3 flex-1 text-sm text-white/70">
              {/* Academic Year Badge - subtle emphasis */}
              {classData.academicYearName && (
                <>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-500/15 border border-slate-500/20 rounded-md">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-300 font-medium">{classData.academicYearName}</span>
                  </div>
                  <span className="text-white/15">|</span>
                </>
              )}
              
              <div className="flex items-center gap-1.5">
                <span className="text-white/40">Subject:</span>
                <span>{classData.subjectName}</span>
              </div>
              
              <span className="text-white/20">|</span>
              
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/50" />
                <span>{classData.classroomName}</span>
              </div>
              
              <span className="text-white/20">|</span>
              
              <div className="flex items-center gap-1.5">
                <span className="text-white/40">Capacity:</span>
                <span>
                  {classData.enrolledCount}/{classData.classroomCapacity}
                  {classData.availableSlots > 0 && (
                    <span className="text-white/40 ml-1">
                      ({classData.availableSlots} available)
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Right: Actions only (teacher moved to left) */}
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
                    onClick={() => setShowEditDialog(true)}
                    className="gap-2.5 cursor-pointer text-white hover:text-white focus:text-white focus:bg-white/10 rounded-lg px-3 py-2.5 transition-all duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="font-medium">Edit Class</span>
                  </DropdownMenuItem>

                  {/* Enable Option - only show if class is disabled */}
                  {!classData.isActive && (
                    <DropdownMenuItem
                      onClick={() => setShowEnableDialog(true)}
                      className="gap-2.5 cursor-pointer text-emerald-400 hover:text-emerald-300 focus:text-emerald-300 focus:bg-emerald-500/10 rounded-lg px-3 py-2.5 transition-all duration-200"
                    >
                      <Play className="w-4 h-4" />
                      <span className="font-medium">Enable Class</span>
                    </DropdownMenuItem>
                  )}

                  {/* Disable Option - only show if class is active */}
                  {classData.isActive && (
                    <DropdownMenuItem
                      onClick={() => setShowDisableDialog(true)}
                      className="gap-2.5 cursor-pointer text-amber-400 hover:text-amber-300 focus:text-amber-300 focus:bg-amber-500/10 rounded-lg px-3 py-2.5 transition-all duration-200"
                    >
                      <Archive className="w-4 h-4" />
                      <span className="font-medium">Disable Class</span>
                    </DropdownMenuItem>
                  )}

                  {/* Delete Option */}
                  {canDelete ? (
                    <DropdownMenuItem
                      onClick={handleDeleteClick}
                      className="gap-2.5 text-rose-400 hover:text-rose-300 focus:text-rose-300 focus:bg-rose-500/10 cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="font-medium">Delete Class</span>
                    </DropdownMenuItem>
                  ) : (
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <div>
                            <DropdownMenuItem disabled className="gap-2.5 rounded-lg px-3 py-2.5 text-white/40">
                              <Trash2 className="w-4 h-4" />
                              <span className="font-medium">Delete Class</span>
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
                              <p className="font-medium text-amber-400 mb-1">Cannot delete this class</p>
                              <p className="text-white/80 text-sm">
                                {hasLessons && hasStudents ? (
                                  <>Remove all {classData.lessonSummary.totalLessons} lesson{classData.lessonSummary.totalLessons > 1 ? 's' : ''} and unenroll all {classData.enrolledCount} student{classData.enrolledCount > 1 ? 's' : ''} first.</>
                                ) : hasLessons ? (
                                  <>Remove all {classData.lessonSummary.totalLessons} lesson{classData.lessonSummary.totalLessons > 1 ? 's' : ''} first.</>
                                ) : (
                                  <>Unenroll all {classData.enrolledCount} student{classData.enrolledCount > 1 ? 's' : ''} first.</>
                                )}
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

      {/* Edit Class Info Dialog */}
      <EditClassInfoDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        classData={classData}
        onSuccess={handleEditSuccess}
      />

      {/* Disable Class Dialog */}
      <DisableClassDialog
        open={showDisableDialog}
        onOpenChange={setShowDisableDialog}
        classData={classData}
        onSuccess={() => {
          if (onUpdate) onUpdate();
        }}
      />

      {/* Enable Class Dialog */}
      <EnableClassDialog
        open={showEnableDialog}
        onOpenChange={setShowEnableDialog}
        classData={classData}
        onSuccess={() => {
          if (onUpdate) onUpdate();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Class"
        description={`Are you sure you want to delete "${classData.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Class'}
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default ClassPageHeader;
