import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetOverlay,
  SheetPortal,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertCircle,
  AlertTriangle,
  Eye,
  Edit,
  Edit3,
  ChevronDown,
  X,
  Play,
  CalendarClock,
} from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import { formatTimeRangeWithoutSeconds } from '@/utils/timeFormatUtils';
import LessonStatusBadge from '../LessonStatusBadge';
import GlassCard from '@/components/common/GlassCard';
import { canTransitionToStatus, canRescheduleLesson } from '@/types/api/lesson';
import LessonNotesDisplaySection from '../modals/LessonNotesDisplaySection';
import LessonHomeworkDisplaySection from '../modals/LessonHomeworkDisplaySection';
import LessonStudentRecapSection from '../modals/LessonStudentRecapSection';
import { DEFAULT_CONDUCT_GRACE_MINUTES, canConductLesson as canConductLessonNow, getCannotConductReason, isPastUnstartedLesson } from '../../lessonMode';

interface LessonDetailsSheetProps {
  lesson: LessonResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConduct?: (lesson: LessonResponse) => void;
  onCancel?: (lesson: LessonResponse) => void;
  onReschedule?: (lesson: LessonResponse) => void;
  onCreateMakeup?: (lesson: LessonResponse) => void;
  onEdit?: (lesson: LessonResponse) => void;
  /** Handler to open teaching mode / edit lesson details (attendance, homework, comments) */
  onEditLessonDetails?: (lesson: LessonResponse) => void;
}

const LessonDetailsSheet: React.FC<LessonDetailsSheetProps> = ({
  lesson,
  open,
  onOpenChange,
  onConduct,
  onCancel,
  onReschedule,
  onCreateMakeup,
  onEdit,
  onEditLessonDetails,
}) => {
  const [showMetadata, setShowMetadata] = React.useState(false);

  if (!lesson) return null;

  const canConduct = canTransitionToStatus(lesson.statusName, 'Conducted');
  const canCancel = canTransitionToStatus(lesson.statusName, 'Cancelled');
  const canReschedule = canRescheduleLesson(lesson.statusName);
  const canCreateMakeup = lesson.statusName === 'Cancelled' && !lesson.makeupLessonId;
  const isConducted = lesson.statusName === 'Conducted';
  const isScheduled = lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
  const statusAllowsConduct = isScheduled;
  
  // Check if this is a past unstarted lesson
  const isPastUnstarted = isPastUnstartedLesson(
    lesson.statusName,
    lesson.scheduledDate,
    lesson.endTime
  );
  
  const canConductLesson = canConductLessonNow(
    lesson.statusName,
    lesson.scheduledDate,
    lesson.startTime,
    DEFAULT_CONDUCT_GRACE_MINUTES
  );
  const conductDisabledReason = getCannotConductReason(
    lesson.statusName,
    lesson.scheduledDate,
    lesson.startTime,
    DEFAULT_CONDUCT_GRACE_MINUTES
  );
  
  // Determine if we can open the teaching/editing interface
  // Past unstarted lessons go directly to editing mode (not teaching mode)
  const canAccessTeachingMode = isScheduled || isConducted;

  const lessonDate = new Date(lesson.scheduledDate);
  const isToday = lessonDate.toDateString() === new Date().toDateString();

  // Format date nicely
  const formattedDate = lessonDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPortal>
        <SheetOverlay className="bg-black/20" />
        <SheetContent
          side="right"
          hideCloseButton
          className="w-full sm:w-[600px] sm:max-w-[600px] lg:w-[700px] lg:max-w-[700px] bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/10 text-white shadow-2xl p-0"
        >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <SheetHeader className="px-4 py-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between w-full gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <SheetTitle className="text-lg font-semibold text-white truncate">
                  Lesson Details
                </SheetTitle>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <LessonStatusBadge status={lesson.statusName} />
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-4">
              {/* Class Information - Compact */}
              <GlassCard className="p-3">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Lesson Snapshot
                </h3>
                <div className="space-y-1 text-sm text-white/80">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-white font-semibold">{lesson.className}</span>
                    <span className="text-white/60">· {lesson.subjectName}</span>
                    <span className="text-white/60">· {lesson.teacherName}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-white">{formattedDate}</span>
                    <span className="text-white/60">· {formatTimeRangeWithoutSeconds(lesson.startTime, lesson.endTime)}</span>
                    {lesson.classroomName && (
                      <span className="text-white/60">· {lesson.classroomName}</span>
                    )}
                    {isToday && (
                      <Badge
                        variant="outline"
                        className="text-yellow-300 border-yellow-300/40 bg-yellow-300/10 text-[11px]"
                      >
                        Today
                      </Badge>
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* Past Unstarted Warning Banner */}
              {isPastUnstarted && (
                <GlassCard className="p-3 border-amber-500/30 bg-amber-500/10">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-300 mb-1">
                        Lesson Needs Documentation
                      </h4>
                      <p className="text-xs text-amber-200/80">
                        This lesson's scheduled time has passed but it was never started. 
                        Please document attendance and mark the lesson as conducted, cancelled, or no-show.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Teacher Notes - Only for conducted lessons */}
              {isConducted && (
                <div className="space-y-2">
                  <LessonStudentRecapSection lessonId={lesson.id} onEditLessonDetails={onEditLessonDetails} lesson={lesson} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <LessonNotesDisplaySection lessonId={lesson.id} />
                    <LessonHomeworkDisplaySection lessonId={lesson.id} />
                  </div>
                </div>
              )}

              {/* Status Information - For non-conducted lessons */}
              {!isConducted && !isPastUnstarted && (
                <GlassCard className="p-3">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-purple-400" />
                    Status Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/60 text-xs block mb-1">
                        Current Status
                      </label>
                      <LessonStatusBadge status={lesson.statusName} size="lg" />
                    </div>

                    <div>
                      <label className="text-white/60 text-xs block mb-1">
                        Generation Source
                      </label>
                      <Badge
                        variant="outline"
                        className="text-white/80 border-white/20 bg-white/5 text-xs"
                      >
                        {lesson.generationSource === 'automatic'
                          ? 'Auto-generated'
                          : lesson.generationSource === 'makeup'
                          ? 'Makeup Lesson'
                          : 'Manual'}
                      </Badge>
                    </div>

                    {lesson.conductedAt && (
                      <div>
                        <label className="text-white/60 text-xs block mb-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Conducted At
                        </label>
                        <p className="text-white text-sm">
                          {new Date(lesson.conductedAt).toLocaleString(
                            'en-US',
                            {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>
                    )}

                    {lesson.cancellationReason && (
                      <div>
                        <label className="text-white/60 text-xs block mb-1 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Cancellation Reason
                        </label>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                          <p className="text-white text-sm">
                            {lesson.cancellationReason}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              )}

              {/* Related Lessons */}
              {(lesson.makeupLessonId || lesson.originalLessonId) && (
                <GlassCard className="p-3">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-purple-400" />
                    Related Lessons
                  </h3>
                  <div className="space-y-2">
                    {lesson.originalLessonId && (
                      <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                        <div>
                          <span className="text-white/60 text-xs block">
                            This is a makeup lesson for:
                          </span>
                          <span className="text-white text-sm font-medium">
                            Original Lesson
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 text-xs"
                          onClick={() => {
                            console.log(
                              'Navigate to original lesson:',
                              lesson.originalLessonId
                            );
                          }}
                        >
                          View Original
                        </Button>
                      </div>
                    )}

                    {lesson.makeupLessonId && (
                      <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
                        <div>
                          <span className="text-white/60 text-xs block">
                            This lesson has a makeup:
                          </span>
                          <span className="text-white text-sm font-medium">
                            Makeup Lesson
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 text-xs"
                          onClick={() => {
                            console.log(
                              'Navigate to makeup lesson:',
                              lesson.makeupLessonId
                            );
                          }}
                        >
                          View Makeup
                        </Button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              )}

              {/* Metadata - Collapsible */}
              <button
                onClick={() => setShowMetadata(!showMetadata)}
                className="w-full flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors p-2 text-sm"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showMetadata ? 'rotate-180' : ''
                  }`}
                />
                <span>Show Metadata</span>
              </button>

              {showMetadata && (
                <GlassCard className="p-3">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Metadata
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-white/60 block mb-1">
                        Lesson ID
                      </label>
                      <p className="text-white/80 font-mono bg-white/5 rounded px-2 py-1 break-all">
                        {lesson.id}
                      </p>
                    </div>
                    <div>
                      <label className="text-white/60 block mb-1">
                        Class ID
                      </label>
                      <p className="text-white/80 font-mono bg-white/5 rounded px-2 py-1 break-all">
                        {lesson.classId}
                      </p>
                    </div>
                    <div>
                      <label className="text-white/60 block mb-1">
                        Created At
                      </label>
                      <p className="text-white/80 text-xs">
                        {new Date(lesson.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-white/60 block mb-1">
                        Updated At
                      </label>
                      <p className="text-white/80 text-xs">
                        {new Date(lesson.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Spacing for action buttons at bottom */}
              <div className="h-4" />
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="border-t border-white/10 bg-white/5 p-4 flex-shrink-0">
            <div className="flex flex-wrap items-center justify-end gap-2">
              {onEdit && (
                <Button
                  onClick={() => onEdit(lesson)}
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/10 text-sm"
                >
                  <Edit className="w-3 h-3 mr-2" />
                  Edit
                </Button>
              )}

              {canCreateMakeup && onCreateMakeup && (
                <Button
                  onClick={() => onCreateMakeup(lesson)}
                  variant="ghost"
                  className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 text-sm"
                  title="Add an extra lesson to compensate for this cancelled lesson."
                >
                  <RotateCcw className="w-3 h-3 mr-2" />
                  Schedule replacement lesson
                </Button>
              )}

              {/* Cancel lesson - Destructive action with clear labeling */}
              {canCancel && onCancel && (
                <Button
                  onClick={() => onCancel(lesson)}
                  variant="ghost"
                  className="text-red-300 hover:text-red-200 hover:bg-red-500/10 text-sm"
                >
                  <XCircle className="w-3 h-3 mr-2" />
                  Cancel lesson
                </Button>
              )}

              {/* Change schedule - Available for Scheduled and Make Up statuses, but not past unstarted */}
              {canReschedule && !isPastUnstarted && onReschedule && (
                <Button
                  onClick={() => onReschedule(lesson)}
                  variant="ghost"
                  className="text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 text-sm"
                  title="Move this lesson to a different time. No additional lesson is added."
                >
                  <CalendarClock className="w-3 h-3 mr-2" />
                  Change schedule
                </Button>
              )}

              {/* Quick mark as conducted - only for past unstarted lessons */}
              {isPastUnstarted && canConduct && statusAllowsConduct && onConduct && (
                <Button
                  onClick={() => onConduct(lesson)}
                  variant="ghost"
                  title="Mark this as conducted without entering detailed attendance."
                  className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 text-sm"
                >
                  <CheckCircle className="w-3 h-3 mr-2" />
                  Quick mark as conducted
                </Button>
              )}

              {/* Document Lesson Button for Past Unstarted - Primary action */}
              {isPastUnstarted && onEditLessonDetails && (
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    onEditLessonDetails(lesson);
                  }}
                  className="text-sm bg-amber-600/20 text-white hover:bg-amber-600/30"
                >
                  <Edit3 className="w-3 h-3 mr-2" />
                  Document Lesson
                </Button>
              )}

              {/* Teaching Mode / Edit Details Button - Primary action (not for past unstarted) */}
              {/* Uses unified blue primary style for both Start Teaching and View Summary */}
              {!isPastUnstarted && canAccessTeachingMode && onEditLessonDetails && (
                <Button
                  onClick={() => {
                    if (isConducted || canConductLesson) {
                      onOpenChange(false);
                      onEditLessonDetails(lesson);
                    }
                  }}
                  disabled={isScheduled && !canConductLesson}
                  title={
                    isScheduled && !canConductLesson
                      ? conductDisabledReason || 'Teaching mode is available once the lesson window opens'
                      : undefined
                  }
                  className="text-sm bg-blue-600/20 text-white hover:bg-blue-600/30 disabled:bg-blue-600/10 disabled:text-white/50"
                >
                  {isConducted ? (
                    <>
                      <Eye className="w-3 h-3 mr-2" />
                      View Summary
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-2" />
                      Start Teaching
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
};

export default LessonDetailsSheet;
