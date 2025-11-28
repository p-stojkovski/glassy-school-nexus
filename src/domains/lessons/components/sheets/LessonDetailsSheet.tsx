import React from 'react';
import { motion } from 'framer-motion';
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
  Calendar,
  Clock,
  User,
  MapPin,
  BookOpen,
  FileText,
  CheckCircle,
  XCircle,
  RotateCcw,
  History,
  AlertCircle,
  Eye,
  Edit,
  ChevronDown,
} from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import LessonStatusBadge from '../LessonStatusBadge';
import GlassCard from '@/components/common/GlassCard';
import { canTransitionToStatus } from '@/types/api/lesson';
import LessonNotesDisplaySection from '../modals/LessonNotesDisplaySection';
import LessonHomeworkDisplaySection from '../modals/LessonHomeworkDisplaySection';
import LessonStudentRecapSection from '../modals/LessonStudentRecapSection';

interface LessonDetailsSheetProps {
  lesson: LessonResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConduct?: (lesson: LessonResponse) => void;
  onCancel?: (lesson: LessonResponse) => void;
  onCreateMakeup?: (lesson: LessonResponse) => void;
  onEdit?: (lesson: LessonResponse) => void;
}

const LessonDetailsSheet: React.FC<LessonDetailsSheetProps> = ({
  lesson,
  open,
  onOpenChange,
  onConduct,
  onCancel,
  onCreateMakeup,
  onEdit,
}) => {
  const [showMetadata, setShowMetadata] = React.useState(false);

  if (!lesson) return null;

  const canConduct = canTransitionToStatus(lesson.statusName, 'Conducted');
  const canCancel = canTransitionToStatus(lesson.statusName, 'Cancelled');
  const canCreateMakeup = lesson.statusName === 'Cancelled' && !lesson.makeupLessonId;
  const isConducted = lesson.statusName === 'Conducted';

  const lessonDate = new Date(lesson.scheduledDate);
  const isToday = lessonDate.toDateString() === new Date().toDateString();
  const isPast = lessonDate < new Date();
  const isFuture = lessonDate > new Date();

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
          className="w-full sm:w-[600px] sm:max-w-[600px] lg:w-[800px] lg:max-w-[800px] bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white shadow-2xl p-0"
        >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <SheetHeader className="p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-400" />
                <SheetTitle className="text-lg sm:text-xl text-white">
                  Lesson Details
                </SheetTitle>
              </div>
              <LessonStatusBadge status={lesson.statusName} />
            </div>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-4 sm:p-6">
              {/* Class Information - Compact */}
              <GlassCard className="p-3">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-400" />
                  Lesson Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-white/60 text-xs block mb-1">
                      Class Name
                    </label>
                    <p className="text-white text-sm font-medium">
                      {lesson.className}
                    </p>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs block mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Subject
                    </label>
                    <p className="text-white text-sm font-medium">
                      {lesson.subjectName}
                    </p>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs block mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Teacher
                    </label>
                    <p className="text-white text-sm font-medium">
                      {lesson.teacherName}
                    </p>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs block mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Classroom
                    </label>
                    <p className="text-white text-sm font-medium">
                      {lesson.classroomName}
                    </p>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs block mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Date
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white text-sm font-medium">
                        {formattedDate}
                      </p>
                      {isToday && (
                        <Badge
                          variant="outline"
                          className="text-yellow-400 border-yellow-400/50 bg-yellow-400/10 text-xs"
                        >
                          Today
                        </Badge>
                      )}
                      {isPast && !isToday && (
                        <Badge
                          variant="outline"
                          className="text-gray-400 border-gray-400/50 bg-gray-400/10 text-xs"
                        >
                          Past
                        </Badge>
                      )}
                      {isFuture && (
                        <Badge
                          variant="outline"
                          className="text-green-400 border-green-400/50 bg-green-400/10 text-xs"
                        >
                          Upcoming
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs block mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Time
                    </label>
                    <p className="text-white text-sm font-medium">
                      {lesson.startTime} - {lesson.endTime}
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Teacher Notes - Only for conducted lessons */}
              {isConducted && (
                <LessonNotesDisplaySection lessonId={lesson.id} />
              )}

              {/* Homework Assignment - Only for conducted lessons */}
              {isConducted && (
                <LessonHomeworkDisplaySection lessonId={lesson.id} />
              )}

              {/* Student Records - Only for conducted lessons */}
              {isConducted && (
                <LessonStudentRecapSection lessonId={lesson.id} />
              )}

              {/* Status Information - For non-conducted lessons */}
              {!isConducted && (
                <GlassCard className="p-3">
                  <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
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
                  <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
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
                  <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
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
          <div className="border-t border-white/10 bg-gradient-to-t from-gray-900/50 p-4 sm:p-6 flex-shrink-0">
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-white/70 hover:bg-white/10 text-sm"
              >
                Close
              </Button>

              {onEdit && (
                <Button
                  onClick={() => onEdit(lesson)}
                  variant="ghost"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-sm"
                >
                  <Edit className="w-3 h-3 mr-2" />
                  Edit
                </Button>
              )}

              {canCreateMakeup && onCreateMakeup && (
                <Button
                  onClick={() => onCreateMakeup(lesson)}
                  className="bg-purple-500 hover:bg-purple-600 text-white text-sm"
                >
                  <RotateCcw className="w-3 h-3 mr-2" />
                  Create Makeup
                </Button>
              )}

              {canCancel && onCancel && (
                <Button
                  onClick={() => onCancel(lesson)}
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm"
                >
                  <XCircle className="w-3 h-3 mr-2" />
                  Cancel
                </Button>
              )}

              {canConduct && onConduct && (
                <Button
                  onClick={() => onConduct(lesson)}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm"
                >
                  <CheckCircle className="w-3 h-3 mr-2" />
                  Mark as Conducted
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
