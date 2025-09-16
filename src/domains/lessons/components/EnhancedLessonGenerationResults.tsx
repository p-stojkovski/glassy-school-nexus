import React from 'react';
import { 
  CalendarDays, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  MapPin,
  User,
  BookOpen,
  Coffee,
  Gift,
  AlertOctagon 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/common/GlassCard';
import { EnhancedLessonGenerationResult, EnhancedSkippedLesson } from '@/types/api/lesson-generation-enhanced';

interface EnhancedResultsProps {
  result: EnhancedLessonGenerationResult;
}

interface SkippedLessonDetailsProps {
  skippedLesson: EnhancedSkippedLesson;
  index: number;
}

// Component to render skip reason details
const SkippedLessonDetails: React.FC<SkippedLessonDetailsProps> = ({ skippedLesson, index }) => {
  const { skipReason, skipDetails, scheduledDate, dayOfWeek, startTime, endTime } = skippedLesson;
  
  const formatTime = (time: string) => {
    // Convert "14:00:00" to "2:00 PM"
    try {
      const [hour, minute] = time.split(':');
      const hourNum = parseInt(hour);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum % 12 || 12;
      return `${displayHour}:${minute} ${period}`;
    } catch {
      return time;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const renderSkipReason = () => {
    // Early return if skipDetails is null to prevent null reference errors
    if (!skipDetails) {
      return (
        <div className="skip-reason default bg-gray-500/10 border border-gray-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-300">
            <AlertTriangle className="w-5 h-5" />
            <span>Skipped: {skipReason} (No details available)</span>
          </div>
        </div>
      );
    }

    switch (skipReason) {
      case 'teaching_break':
        const breakInfo = skipDetails?.breakDetails;
        if (!breakInfo) return null;
        
        // If this break is actually a holiday, render using the holiday UI for consistency
        if (breakInfo.breakType?.toLowerCase() === 'holiday') {
          return (
            <div className="skip-reason holiday bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Gift className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-grow">
                  <div className="font-semibold text-blue-200 text-lg">{breakInfo.breakName}</div>
                  <div className="text-blue-300 text-sm mt-1">
                    {formatDate(breakInfo.breakStartDate)}{breakInfo.breakStartDate !== breakInfo.breakEndDate ? ` - ${formatDate(breakInfo.breakEndDate)}` : ''}
                  </div>
                  <Badge variant="outline" className="text-blue-400 border-blue-400/50 mt-2">
                    Holiday
                  </Badge>
                  {breakInfo.breakNotes && (
                    <div className="text-blue-100/80 text-sm mt-3 italic">
                      {breakInfo.breakNotes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="skip-reason break bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Coffee className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-grow">
                <div className="font-semibold text-green-200 text-lg">{breakInfo.breakName}</div>
                <Badge variant="outline" className="text-green-400 border-green-400/50 mt-2">
                  {breakInfo.breakType}
                </Badge>
                <div className="text-green-300 text-sm mt-2">
                  <span className="font-medium">Duration:</span>{' '}
                  {formatDate(breakInfo.breakStartDate)} - {formatDate(breakInfo.breakEndDate)}
                </div>
                {breakInfo.breakNotes && (
                  <div className="text-green-100/80 text-sm mt-3 italic">
                    {breakInfo.breakNotes}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'existing_lesson_conflict':
        const conflict = skipDetails?.conflictDetails;
        const existingLesson = skipDetails?.existingLessonDetails;
        if (!conflict) return null;
        
        return (
          <div className="skip-reason conflict bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AlertOctagon className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-grow">
                <div className="font-semibold text-red-200 text-lg">
                  {conflict.conflictType === 'classroom_conflict' ? 'Classroom Conflict' : 'Teacher Conflict'}
                </div>
                <div className="text-red-300 text-sm mt-1">
                  <strong>Conflicting Class:</strong> {conflict.conflictingClassName}
                </div>
                <div className="text-red-300 text-sm mt-1">
                  <strong>Teacher:</strong> {conflict.conflictingTeacherName} | 
                  <strong> Room:</strong> {conflict.conflictingClassroomName}
                </div>
                <div className="text-red-300 text-sm mt-1">
                  <strong>Time:</strong> {formatTime(conflict.conflictingStartTime)} - {formatTime(conflict.conflictingEndTime)}
                </div>
                <div className="text-red-300 text-sm mt-1">
                  <strong>Status:</strong> {conflict.conflictingLessonStatus}
                </div>
                {existingLesson?.reason && (
                  <div className="text-red-100/80 text-sm mt-3 italic">
                    {existingLesson.reason}
                  </div>
                )}
                <Badge variant="outline" className="text-red-400 border-red-400/50 mt-2">
                  {conflict.conflictType.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="skip-reason default bg-gray-500/10 border border-gray-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-300">
              <AlertTriangle className="w-5 h-5" />
              <span>Skipped: {skipReason}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="skipped-lesson mb-4">
      {/* Lesson Time Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-white">
          <div className="font-medium">{formatDate(scheduledDate)} ({dayOfWeek})</div>
          <div className="text-white/60 text-sm">
            {formatTime(startTime)} - {formatTime(endTime)}
          </div>
        </div>
        <Badge variant="outline" className="text-white/60 border-white/20">
          Skip #{index + 1}
        </Badge>
      </div>
      
      {/* Skip Reason Details */}
      {renderSkipReason()}
    </div>
  );
};

// Main component for enhanced results display
const EnhancedLessonGenerationResults: React.FC<EnhancedResultsProps> = ({ result }) => {
  const hasErrors = false; // Your backend doc shows errors array is always empty in current version
  const hasSkipped = result.skippedCount > 0;
  const hasDetailedSkips = result.skippedLessons && result.skippedLessons.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{result.generatedCount}</div>
          <div className="text-white/60 text-sm">Generated</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{result.skippedCount}</div>
          <div className="text-white/60 text-sm">Skipped</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Gift className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{result.publicHolidaySkips}</div>
          <div className="text-white/60 text-sm">Holidays</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Coffee className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{result.teachingBreakSkips}</div>
          <div className="text-white/60 text-sm">Breaks</div>
        </GlassCard>
      </div>

      {/* Generation Summary */}
      <GlassCard className="p-4">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-purple-400" />
          Generation Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/60">Period:</span>
            <span className="text-white ml-2">
              {new Date(result.generationStartDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })} - {new Date(result.generationEndDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          <div>
            <span className="text-white/60">Mode:</span>
            <span className="text-white ml-2">{result.generationMode}</span>
          </div>
        </div>
      </GlassCard>

      {/* Detailed Skip Information */}
      {hasDetailedSkips && (
        <GlassCard className="p-4">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Skipped Lessons & Reasons
          </h4>
          <div className="space-y-4">
            {result.skippedLessons.map((lesson, index) => (
              <SkippedLessonDetails 
                key={`${lesson.scheduledDate}-${lesson.startTime}`} 
                skippedLesson={lesson} 
                index={index}
              />
            ))}
          </div>
        </GlassCard>
      )}

      {/* Generated Lessons Preview (if any) */}
      {result.generatedLessons && result.generatedLessons.length > 0 && (
        <GlassCard className="p-4">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Generated Lessons
          </h4>
          <div className="space-y-3">
            {result.generatedLessons.slice(0, 5).map((lesson, index) => (
              <div key={lesson.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <CalendarDays className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm">
                      {new Date(lesson.scheduledDate + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })} ({lesson.dayOfWeek})
                    </div>
                    <div className="text-white/60 text-xs">
                      {lesson.startTime.slice(0, 5)} - {lesson.endTime.slice(0, 5)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <User className="w-3 h-3" />
                    {lesson.teacherName}
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-xs mt-1">
                    <MapPin className="w-3 h-3" />
                    {lesson.classroomName}
                  </div>
                </div>
              </div>
            ))}
            {result.generatedLessons.length > 5 && (
              <div className="text-center text-white/60 text-sm py-2">
                ... and {result.generatedLessons.length - 5} more lessons
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default EnhancedLessonGenerationResults;