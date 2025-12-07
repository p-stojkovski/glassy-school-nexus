import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  Clock,
  Lightbulb,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LessonConflict } from '@/types/api/lesson';

export interface ConflictSuggestion {
  type: 'next_weekday' | 'next_week' | 'custom';
  label: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
}

interface ConflictPanelProps {
  conflicts: LessonConflict[];
  suggestions: ConflictSuggestion[];
  checking: boolean;
  error: string | null;
  validationWarning?: string | null;
  academicYearName?: string | null;
  className?: string;
  onSuggestionClick: (suggestion: ConflictSuggestion) => void;
  onProceedAnyway?: () => void;
  showProceedButton?: boolean;
}

const ConflictPanel: React.FC<ConflictPanelProps> = ({
  conflicts,
  suggestions,
  checking,
  error,
  validationWarning,
  academicYearName,
  className = '',
  onSuggestionClick,
  onProceedAnyway,
  showProceedButton = false,
}) => {
  const hasConflicts = conflicts.length > 0;
  const hasError = !!error;
  const hasChecked = !checking && !hasError;
  const showPanel = checking || hasConflicts || hasError || hasChecked;

  if (!showPanel) {
    return null;
  }

  const getConflictIcon = (conflictType: string) => {
    switch (conflictType) {
      case 'teacher_conflict':
        return <User className="w-4 h-4 text-amber-400" />;
      case 'classroom_conflict':
        return <MapPin className="w-4 h-4 text-red-400" />;
      case 'existing_lesson':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    }
  };

  const getConflictTypeLabel = (conflictType: string) => {
    switch (conflictType) {
      case 'teacher_conflict':
        return 'Teacher Unavailable';
      case 'classroom_conflict':
        return 'Classroom Occupied';
      case 'existing_lesson':
        return 'Lesson Already Exists';
      default:
        return 'Schedule Conflict';
    }
  };

  const isValidISODate = (value?: string) => {
    if (!value) return false;
    // Expecting YYYY-MM-DD
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDatePattern.test(value)) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  };

  const formatConflictTime = (conflict: LessonConflict) => {
    const hasValidDate = isValidISODate(conflict.scheduledDate);
    const date = hasValidDate ? new Date(conflict.scheduledDate) : null;
    const dayName = date ? date.toLocaleDateString('en-US', { weekday: 'short' }) : 'Date';
    const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'unknown';

    const start = conflict.startTime || '—';
    const end = conflict.endTime || '—';

    return `${dayName}, ${dateStr} • ${start} - ${end}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, marginTop: 0 }}
        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
        exit={{ opacity: 0, height: 0, marginTop: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`overflow-hidden ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className={`rounded-lg p-4 ${
          hasConflicts || hasError
            ? 'bg-orange-500/10 border border-orange-500/20'
            : checking
              ? 'bg-orange-500/10 border border-orange-500/20'
              : 'bg-green-500/10 border border-green-500/20'
        }`}>
          {/* Checking State */}
          {checking && (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-orange-400 animate-spin flex-shrink-0" />
              <div>
                <p className="text-orange-200 font-medium text-sm">Checking for conflicts...</p>
                <p className="text-orange-200/60 text-xs">Verifying teacher and classroom availability</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && !checking && (
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-orange-200 font-medium text-sm">Unable to check conflicts</p>
                <p className="text-orange-200/70 text-xs">{error}</p>
              </div>
            </div>
          )}

          {/* Conflicts Display */}
          {hasConflicts && !checking && (
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <p className="text-orange-200 font-semibold text-sm">
                  {conflicts.length === 1 ? '1 Conflict Detected' : `${conflicts.length} Conflicts Detected`}
                </p>
              </div>

              {/* Conflicts List - Compact */}
              <div className="space-y-2">
                {conflicts.slice(0, 3).map((conflict, index) => (
                  <motion.div
                    key={`${conflict.conflictingLessonId}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-md p-2.5 flex items-start gap-2.5"
                  >
                    {getConflictIcon(conflict.conflictType)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <Badge 
                          variant="outline" 
                          className="bg-red-500/20 text-red-300 border-red-500/30 text-xs py-0 px-1.5"
                        >
                          {getConflictTypeLabel(conflict.conflictType)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white/80 text-xs font-medium leading-snug">
                          {conflict.conflictingClassName && conflict.conflictingClassName.trim().length > 0
                            ? conflict.conflictingClassName
                            : conflict.conflictType === 'teacher_conflict'
                              ? 'Teacher unavailable'
                              : 'Classroom occupied'}
                        </p>
                        {(conflict.startTime || conflict.endTime) && (
                          <p className="text-white/60 text-xs whitespace-nowrap">
                            {conflict.startTime} - {conflict.endTime}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Show "and more" indicator if there are additional conflicts */}
                {conflicts.length > 3 && (
                  <div className="text-xs text-orange-300/70 px-2">
                    +{conflicts.length - 3} more
                  </div>
                )}
              </div>

              {/* Suggestions Section */}
              {suggestions.length > 0 && (
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <p className="text-yellow-200 font-medium text-sm">Suggested Alternative Times</p>
                  </div>

                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion.type}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSuggestionClick(suggestion)}
                          className="w-full justify-between bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all duration-200"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-blue-400" />
                            <span className="text-sm">{suggestion.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/60">
                              {suggestion.startTime} - {suggestion.endTime}
                            </span>
                            <ChevronRight className="w-3 h-3 text-white/40" />
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proceed Anyway Button */}
              {onProceedAnyway && (
                <div className="border-t border-white/10 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onProceedAnyway}
                    className="w-full text-orange-300 hover:text-orange-200 hover:bg-orange-500/10 border border-orange-500/30 hover:border-orange-500/50"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Override Conflicts & Proceed
                  </Button>
                  <p className="text-xs text-orange-200/60 mt-2 text-center">
                    This will create the lesson despite scheduling conflicts
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No Conflicts State */}
          {!checking && !hasConflicts && !hasError && hasChecked && (
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-200 font-semibold text-sm">No conflicts detected</p>
                <p className="text-green-200/70 text-xs">
                  {academicYearName 
                    ? `No conflicts detected in ${academicYearName}` 
                    : 'This time slot is available - ready to create lesson'}
                </p>
              </div>
            </div>
          )}

          {/* Validation Warning - Display when no active academic year */}
          {validationWarning && !checking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="border-t border-white/10 pt-3 mt-3"
            >
              <div className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/20 rounded-md p-2.5">
                <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-orange-200 text-xs leading-relaxed">
                  {validationWarning}
                </p>
              </div>
            </motion.div>
          )}

          {/* Academic Year Context */}
          {academicYearName && !validationWarning && !checking && hasChecked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="border-t border-white/10 pt-3 mt-3"
            >
              <p className="text-white/60 text-xs text-center">
                Checking conflicts for <span className="font-semibold text-white/80">{academicYearName}</span>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConflictPanel;

