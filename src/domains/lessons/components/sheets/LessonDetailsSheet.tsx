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
  Info,
  User,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
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
      <SheetContent
        side="right"
        hideCloseButton
        className="w-full sm:w-[600px] sm:max-w-[600px] lg:w-[700px] lg:max-w-[700px] bg-white/10 backdrop-blur-md border border-white/20 text-white p-0"
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <SheetHeader className="px-4 py-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between w-full gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="w-5 h-5 text-yellow-400 flex-shrink-0" />
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
              {/* Class Information */}
              <GlassCard className="p-4">
                <h3 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-yellow-400" />
                  Lesson Information
                </h3>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-white font-semibold text-base">{lesson.className}</span>
                    <span className="text-white/60 text-sm">•</span>
                    <span className="text-white/70 text-sm">{lesson.subjectName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <User className="w-4 h-4 text-white/50" />
                    <span>{lesson.teacherName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Calendar className="w-4 h-4 text-white/50" />
                    <span>{formattedDate}</span>
                    {isToday && (
                      <Badge className="text-yellow-300 border-yellow-300/40 bg-yellow-300/10">
                        Today
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Clock className="w-4 h-4 text-white/50" />
                    <span>{formatTimeRangeWithoutSeconds(lesson.startTime, lesson.endTime)}</span>
                  </div>
                  {lesson.classroomName && (
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <MapPin className="w-4 h-4 text-white/50" />
                      <span>{lesson.classroomName}</span>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Past Unstarted Warning */}
              {isPastUnstarted && (
                <GlassCard className="p-4 border-amber-500/30 bg-amber-500/10">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-amber-300 mb-1">
                        Lesson Needs Documentation
                      </h4>
                      <p className="text-xs text-amber-200/80 leading-relaxed">
                        This lesson's scheduled time has passed but it was never started.
                        Please document attendance and mark the lesson as conducted, cancelled, or no-show.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Upcoming Lesson Status */}
              {!isPastUnstarted && isScheduled && (
                <GlassCard className="p-4 border-blue-500/20 bg-blue-500/10">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-300 mb-1">
                        Upcoming Lesson
                      </h4>
                      <p className="text-xs text-blue-200/80">
                        {canConductLesson
                          ? "Ready to start - click 'Start Teaching' to begin."
                          : conductDisabledReason || "Teaching mode will be available closer to lesson time."}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Conducted Status */}
              {isConducted && (
                <GlassCard className="p-4 border-emerald-500/20 bg-emerald-500/10">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-emerald-300 mb-1">
                        Completed
                      </h4>
                      <p className="text-xs text-emerald-200/80">
                        Conducted on {lesson.conductedAt && new Date(lesson.conductedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Cancelled Status */}
              {lesson.statusName === 'Cancelled' && lesson.cancellationReason && (
                <GlassCard className="p-4 border-rose-500/30 bg-rose-500/10">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-rose-300 mb-1">
                        Cancellation reason
                      </h4>
                      <p className="text-xs text-rose-200/80 leading-relaxed">
                        {lesson.cancellationReason}
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


              {/* Related Lessons */}
              {(lesson.makeupLessonId || lesson.originalLessonId) && (
                <GlassCard className="p-4">
                  <h3 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-purple-400" />
                    Related Lessons
                  </h3>
                  <div className="space-y-2">
                    {lesson.originalLessonId && (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowLeft className="w-4 h-4 text-blue-400" />
                          <div>
                            <p className="text-xs text-white/60">Original Lesson</p>
                            <p className="text-sm text-white font-medium">This is a makeup</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-300 hover:text-blue-200 hover:bg-blue-500/10"
                          onClick={() => {
                            console.log(
                              'Navigate to original lesson:',
                              lesson.originalLessonId
                            );
                          }}
                        >
                          View
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    )}

                    {lesson.makeupLessonId && (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-purple-400" />
                          <div>
                            <p className="text-xs text-white/60">Makeup Lesson</p>
                            <p className="text-sm text-white font-medium">Scheduled replacement</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/10"
                          onClick={() => {
                            console.log(
                              'Navigate to makeup lesson:',
                              lesson.makeupLessonId
                            );
                          }}
                        >
                          View
                          <ChevronRight className="w-4 h-4 ml-1" />
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
          <div className="border-t border-white/10 p-4 flex-shrink-0">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              {/* Left side - Secondary/Tertiary actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Cancel lesson */}
                {canCancel && onCancel && (
                  <Button
                    onClick={() => onCancel(lesson)}
                    variant="ghost"
                    className="text-red-300 hover:text-red-200 hover:bg-red-500/10 text-sm"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel lesson
                  </Button>
                )}

                {/* Change schedule */}
                {canReschedule && !isPastUnstarted && onReschedule && (
                  <Button
                    onClick={() => onReschedule(lesson)}
                    variant="ghost"
                    className="text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 text-sm"
                    title="Move this lesson to a different time. No additional lesson is added."
                  >
                    <CalendarClock className="w-4 h-4 mr-2" />
                    Change schedule
                  </Button>
                )}

                {/* Quick mark as conducted - for past unstarted */}
                {isPastUnstarted && canConduct && statusAllowsConduct && onConduct && (
                  <Button
                    onClick={() => onConduct(lesson)}
                    variant="ghost"
                    title="Mark this as conducted without entering detailed attendance."
                    className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Quick mark as conducted
                  </Button>
                )}

                {/* Edit button */}
                {onEdit && (
                  <Button
                    onClick={() => onEdit(lesson)}
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10 text-sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>

              {/* Right side - Primary action */}
              <div className="flex items-center gap-2">
                {/* Schedule replacement lesson - for cancelled without makeup */}
                {canCreateMakeup && onCreateMakeup && (
                  <Button
                    onClick={() => onCreateMakeup(lesson)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-sm"
                    title="Add an extra lesson to compensate for this cancelled lesson."
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Schedule replacement lesson
                  </Button>
                )}

                {/* Document Lesson - PRIMARY for past unstarted */}
                {isPastUnstarted && onEditLessonDetails && (
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      onEditLessonDetails(lesson);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-sm"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Document Lesson
                  </Button>
                )}

                {/* Start Teaching / View Summary - PRIMARY for others */}
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
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-sm disabled:bg-yellow-500/30 disabled:text-black/50 disabled:cursor-not-allowed"
                  >
                    {isConducted ? (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        View Summary
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Teaching
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LessonDetailsSheet;
