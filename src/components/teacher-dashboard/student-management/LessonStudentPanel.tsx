import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  Users,
  User,
  MapPin,
  Calendar,
  Clock,
  StickyNote,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  History
} from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import { LessonModeConfig } from '@/domains/lessons/types/lessonMode';
import { getLessonModeConfig } from '@/domains/lessons/utils/lessonModeUtils';
import { cn } from '@/lib/utils';
import { formatTimeRange } from '../utils/timeUtils';
import { formatTimeWithoutSeconds } from '@/utils/timeFormatUtils';
import { useLessonStudentData } from '../hooks/useLessonStudentData';
import { useLessonNotes } from '../hooks/useLessonNotes';
import { useLessonHomework } from '../hooks/useLessonHomework';
import { AttendanceCell } from '../student-table/AttendanceCell';
import { HomeworkCell } from '../student-table/HomeworkCell';
import { CommentsCell } from '../student-table/CommentsCell';
import DashboardLoadingState from '../states/DashboardLoadingState';
import { useStudentHistoryExpansion } from '../hooks/useStudentHistoryExpansion';
import StudentHistoryRow from '../student-table/StudentHistoryRow';
import StudentProgressChip from '../student-table/StudentProgressChip';
import LessonStatusBadge from '@/domains/lessons/components/LessonStatusBadge';
import LockedLessonBanner from '@/domains/lessons/components/LockedLessonBanner';
import LessonEditHistorySidebar from '@/domains/lessons/components/LessonEditHistorySidebar';
import { useLessonLocking } from '@/domains/lessons/hooks/useLessonLocking';
import { LessonNotesSheet } from './LessonNotesSheet';
import { HomeworkSheet } from './HomeworkSheet';
import { CompleteLessonDialog } from './CompleteLessonDialog';

interface LessonStudentPanelProps {
  lesson: LessonResponse;
  onEndLesson?: () => void;
  isLoading?: boolean;
  /** Optional mode config override - if not provided, will be derived from lesson status */
  modeConfig?: LessonModeConfig;
}

/**
 * Save status type for unified status display (Phase 6)
 */
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Get status message configuration for unified save status display (Phase 6)
 */
const getStatusMessage = (status: SaveStatus): { text: string; className: string } => {
  switch (status) {
    case 'saving':
      return { text: 'Saving changes...', className: 'text-white/60' };
    case 'saved':
      return { text: 'All changes saved', className: 'text-green-400' };
    case 'error':
      return { text: 'Error saving changes', className: 'text-red-400' };
    case 'idle':
    default:
      return { text: '', className: '' };
  }
};

const LessonStudentPanel: React.FC<LessonStudentPanelProps> = ({
  lesson,
  onEndLesson,
  isLoading = false,
  modeConfig: externalModeConfig,
}) => {
  const navigate = useNavigate();

  // Derive mode config from lesson status if not provided externally
  const modeConfig = externalModeConfig || getLessonModeConfig(lesson.statusName, lesson.scheduledDate);
  const isEditingMode = modeConfig.mode === 'editing';

  // Get locking state from lesson response
  const { isLocked, isGracePeriod, hasAuditHistory, lockMessage } = useLessonLocking(lesson);

  const {
    students,
    loading: studentsLoading,
    error: studentsError,
    unifiedSaveStatus: studentsSaveStatus,
    updateAttendance,
    updateHomework,
    updateComments,
  } = useLessonStudentData(lesson.id);

  const {
    notes,
    loading: notesLoading,
    refetch: refetchNotes,
  } = useLessonNotes(lesson.id);

  // Student history expansion state for expandable rows
  const {
    toggleExpansion,
    isExpanded,
    getHistory,
    getSummary,
    isLoading: isHistoryLoading,
    getError: getHistoryError,
    retryLoad,
  } = useStudentHistoryExpansion({
    classId: lesson.classId,
    currentLessonId: lesson.id,
  });

  // Homework status for header icon indicator
  const { homework: currentHomework } = useLessonHomework(lesson.id);
  const hasHomework = useMemo(() => !!currentHomework?.description?.trim(), [currentHomework]);

  // State for Homework sheet (sidebar)
  const [showHomeworkSheet, setShowHomeworkSheet] = useState(false);
  const [homeworkSheetMode, setHomeworkSheetMode] = useState<'view' | 'assign'>('view');

  // State for Edit History sidebar
  const [showEditHistorySidebar, setShowEditHistorySidebar] = useState(false);

  // State for Lesson Notes sheet
  const [showNotesSheet, setShowNotesSheet] = useState(false);

  // State for Complete Lesson confirmation dialog
  const [showCompleteLessonDialog, setShowCompleteLessonDialog] = useState(false);

  // Content detection helpers
  const hasNotes = useMemo(() => notes.trim().length > 0, [notes]);

  const timeRange = formatTimeRange(
    formatTimeWithoutSeconds(lesson.startTime),
    formatTimeWithoutSeconds(lesson.endTime)
  );
  const roomName = lesson.classroomNameSnapshot || lesson.classroomName || 'Classroom TBD';
  const formattedDate = new Date(lesson.scheduledDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });


  if (studentsLoading || notesLoading) {
    return (
      <DashboardLoadingState
        rows={6}
        className={cn(
          "bg-white/[0.03] border border-white/[0.06] rounded-lg backdrop-blur-lg shadow-lg",
          modeConfig.modeAccentClassName
        )}
        contentClassName="p-2"
      />
    );
  }

  if (studentsError) {
    return (
      <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-lg border-red-500/30 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Students</h3>
          <p className="text-white/70 mb-4">{studentsError}</p>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Lesson Header - Matches ClassPageHeader styling */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Left: Teacher Name */}
          <div className="flex items-center gap-2 min-w-0">
            <User className="w-4 h-4 text-white/50" />
            <span className="text-sm text-white truncate">
              {lesson.teacherName}
            </span>
          </div>

          {/* Separator */}
          <span className="hidden lg:block text-white/20">|</span>

          {/* Center: Lesson metadata */}
          <div className="flex flex-wrap items-center gap-3 flex-1 text-sm text-white/70">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-white/50" />
              <span>{formattedDate}</span>
            </div>

            <span className="text-white/20">|</span>

            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-white/50" />
              <span>{timeRange}</span>
            </div>

            <span className="text-white/20">|</span>

            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-white/50" />
              <span>{roomName}</span>
            </div>

            <span className="text-white/20">|</span>

            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-white/50" />
              <span>{students.length} student{students.length !== 1 ? 's' : ''}</span>
            </div>

            <span className="text-white/20">|</span>

            <LessonStatusBadge
              status={lesson.statusName}
              size="sm"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Lesson Notes Button - always visible with label */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotesSheet(true)}
              className={cn(
                "h-7 px-2.5 gap-1.5 text-xs font-medium transition-colors",
                hasNotes
                  ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Lesson Notes</span>
            </Button>

            {/* Homework Button - always visible with label */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setHomeworkSheetMode('view');
                setShowHomeworkSheet(true);
              }}
              className={cn(
                "h-7 px-2.5 gap-1.5 text-xs font-medium transition-colors",
                hasHomework
                  ? "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Homework</span>
            </Button>

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
                {/* Complete Lesson Option - only show when available */}
                {modeConfig.showEndLessonButton && onEndLesson && !isLocked && (
                  <DropdownMenuItem
                    onClick={() => setShowCompleteLessonDialog(true)}
                    disabled={isLoading}
                    className="gap-2.5 cursor-pointer text-emerald-400 hover:text-emerald-300 focus:text-emerald-300 focus:bg-emerald-500/10 rounded-lg px-3 py-2.5 transition-all duration-200"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">Complete Lesson</span>
                  </DropdownMenuItem>
                )}

                {/* View Edit History Option - only show if history exists */}
                {hasAuditHistory && (
                  <DropdownMenuItem
                    onClick={() => setShowEditHistorySidebar(true)}
                    className="gap-2.5 cursor-pointer text-white hover:text-white focus:text-white focus:bg-white/10 rounded-lg px-3 py-2.5 transition-all duration-200"
                  >
                    <History className="w-4 h-4" />
                    <span className="font-medium">View Edit History</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Locking Status Banner */}
      {isLocked && (
        <LockedLessonBanner variant="locked" message={lockMessage} />
      )}
      {isGracePeriod && !isLocked && (
        <LockedLessonBanner variant="grace" message={lockMessage} />
      )}

      {/* Auto-save Status Notice - shows student data save status */}
      {/* Only render when there's an active status to show */}
      {studentsSaveStatus !== 'idle' && (() => {
        const { text, className } = getStatusMessage(studentsSaveStatus);

        return (
          <div className="px-6 py-2 border-b border-white/10">
            <div className="inline-flex items-center gap-2 text-xs">
              {studentsSaveStatus === 'saving' && <Loader2 className="w-3 h-3 animate-spin" />}
              <span className={className}>{text}</span>
            </div>
          </div>
        );
      })()}

      <div className="space-y-6">

        {/* Student Management Table */}
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
          {/* SCROLLABLE TABLE - fills remaining viewport height minus header elements */}
          <Table wrapperClassName="max-h-[calc(100vh-14rem)] overflow-y-auto dark-scrollbar">
            <TableHeader className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur-sm">
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead className="text-white/90 font-semibold w-1/4">Student</TableHead>
                  <TableHead className="text-white/90 font-semibold w-1/5">Attendance</TableHead>
                  <TableHead className="text-white/90 font-semibold w-1/5">Homework</TableHead>
                  <TableHead className="text-white/90 font-semibold w-[35%]">Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="text-white/60">
                        <Users className="w-12 h-12 mx-auto mb-4 text-white/40" />
                        <p>No students enrolled in this lesson</p>
                        <p className="text-sm mt-2">Students will appear here once they are enrolled in the class</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <React.Fragment key={student.studentId}>
                      {/* Main student row */}
                      <TableRow
                        className="border-white/10 hover:bg-white/5 [&>td]:py-3"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-start gap-2">
                            {/* Expand/Collapse Button */}
                            <button
                              type="button"
                              onClick={() => toggleExpansion(student.studentId)}
                              className="mt-0.5 p-0.5 rounded hover:bg-white/10 transition-colors"
                              aria-label={isExpanded(student.studentId) ? 'Collapse history' : 'Expand history'}
                              aria-expanded={isExpanded(student.studentId)}
                            >
                              {isExpanded(student.studentId) ? (
                                <ChevronDown className="h-4 w-4 text-white/60" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-white/60" />
                              )}
                            </button>

                            {/* Student Info */}
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                {/* Risk Indicator */}
                                {getSummary(student.studentId)?.hasRisk && (
                                  <span
                                    className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"
                                    title="Student needs attention (3+ absences or missing homework)"
                                  />
                                )}

                                {/* Student Name (clickable link to profile) */}
                                <button
                                  onClick={() => navigate(`/students/${student.studentId}`)}
                                  className="text-blue-300 hover:text-blue-200 hover:underline cursor-pointer transition-colors truncate"
                                >
                                  {student.studentName}
                                </button>
                              </div>

                              {/* Progress Summary Chip - pre-loaded stats shown immediately */}
                              <StudentProgressChip
                                summary={getSummary(student.studentId)}
                                preloadedStats={{
                                  last5LateCount: student.last5LateCount,
                                  last5MissingHwCount: student.last5MissingHwCount,
                                  last5AbsentCount: student.last5AbsentCount,
                                }}
                                isLoading={isHistoryLoading(student.studentId)}
                              />
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <AttendanceCell
                            studentId={student.studentId}
                            currentStatus={student.attendanceStatus}
                            saveStatus={student.attendanceSaveStatus}
                            onStatusChange={updateAttendance}
                            disabled={isLoading || isLocked}
                          />
                        </TableCell>

                        <TableCell>
                          <HomeworkCell
                            studentId={student.studentId}
                            currentStatus={student.homeworkStatus}
                            saveStatus={student.homeworkSaveStatus}
                            onStatusChange={updateHomework}
                            disabled={isLoading || isLocked}
                          />
                        </TableCell>

                        <TableCell>
                          <CommentsCell
                            studentId={student.studentId}
                            currentComments={student.comments}
                            saveStatus={student.commentsSaveStatus}
                            onCommentsChange={updateComments}
                            disabled={isLoading || isLocked}
                          />
                        </TableCell>
                      </TableRow>

                      {/* Expanded history row (conditional) */}
                      {isExpanded(student.studentId) && (
                        <StudentHistoryRow
                          history={getHistory(student.studentId)}
                          isLoading={isHistoryLoading(student.studentId)}
                          error={getHistoryError(student.studentId)}
                          onRetry={() => retryLoad(student.studentId)}
                          colSpan={4}
                        />
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
        </div>

      </div>

      {/* Edit History Sidebar - opens when "View Edit History" is clicked */}
      {hasAuditHistory && (
        <LessonEditHistorySidebar
          lessonId={lesson.id}
          open={showEditHistorySidebar}
          onOpenChange={setShowEditHistorySidebar}
        />
      )}

      {/* Lesson Notes Sheet - opens from kebab menu */}
      <LessonNotesSheet
        open={showNotesSheet}
        onOpenChange={setShowNotesSheet}
        lessonId={lesson.id}
        initialNotes={notes}
        onSuccess={() => refetchNotes()}
        disabled={isLocked}
      />

      {/* Homework Sheet - opens from kebab menu */}
      <HomeworkSheet
        open={showHomeworkSheet}
        onOpenChange={setShowHomeworkSheet}
        currentLessonId={lesson.id}
        classId={lesson.classId}
        initialMode={homeworkSheetMode}
        disabled={isLocked}
      />

      {/* Complete Lesson Confirmation Dialog */}
      {onEndLesson && (
        <CompleteLessonDialog
          open={showCompleteLessonDialog}
          onOpenChange={setShowCompleteLessonDialog}
          onConfirm={async () => {
            await onEndLesson();
            setShowCompleteLessonDialog(false);
          }}
          isLoading={isLoading}
          attendanceStatuses={students.map((s) => s.attendanceStatus)}
          lessonNotes={notes}
          homeworkDescription={currentHomework?.description ?? null}
        />
      )}
    </>
  );
};

export default LessonStudentPanel;
