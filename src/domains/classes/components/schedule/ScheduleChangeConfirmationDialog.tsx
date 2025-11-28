import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ScheduleValidationResponse } from '@/types/api/scheduleValidation';

interface ScheduleChangeConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validationResult: ScheduleValidationResponse;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ScheduleChangeConfirmationDialog: React.FC<ScheduleChangeConfirmationDialogProps> = ({
  open,
  onOpenChange,
  validationResult,
  onConfirm,
  isLoading = false,
}) => {
  const [expandedConflicts, setExpandedConflicts] = useState<Set<number>>(new Set());

  const toggleConflictExpanded = (index: number) => {
    const newExpanded = new Set(expandedConflicts);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedConflicts(newExpanded);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const { modifications, totalFutureLessonsToUpdate } = validationResult.modificationImpact;
  const { hasConflicts, isUsingFallbackDateRange, conflicts } = validationResult.conflictInfo;

  const hasModifications = totalFutureLessonsToUpdate > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Schedule Changes Summary
          </DialogTitle>
          <DialogDescription>
            Review modifications and conflicts before saving your changes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Modifications Section */}
          {hasModifications && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                  Schedule Modifications
                </h3>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 space-y-3">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  ⏰ <strong>{totalFutureLessonsToUpdate} future lesson(s)</strong> will be updated
                  with new times
                </p>
                <div className="space-y-2">
                  {modifications.map((mod, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 rounded p-3 text-sm">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {mod.dayOfWeek}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 mt-1">
                        <span className="line-through">{mod.oldStartTime}-{mod.oldEndTime}</span>
                        {' → '}
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {mod.newStartTime}-{mod.newEndTime}
                        </span>
                      </div>
                      <div className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                        {mod.futureLessonCount} lesson(s) • {new Date(mod.earliestAffectedDate).toLocaleDateString()} to {new Date(mod.latestAffectedDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 italic">
                  ℹ️ Past lessons remain unchanged
                </p>
              </div>
            </div>
          )}

          {/* Fallback warning */}
          {isUsingFallbackDateRange && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                ⚠️ No active academic year found. Checking next 90 days for conflicts.
              </p>
            </div>
          )}

          {/* Conflicts Section */}
          {hasConflicts && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <h3 className="font-semibold text-red-600 dark:text-red-400">
                  Scheduling Conflicts Detected
                </h3>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4 space-y-3">
                {conflicts.length === 0 ? (
                  <p className="text-sm text-red-900 dark:text-red-300">
                    No specific conflicts found.
                  </p>
                ) : (
                  conflicts.map((conflict, idx) => (
                    <div key={idx} className="space-y-2">
                      <button
                        onClick={() => toggleConflictExpanded(idx)}
                        className="w-full flex items-center justify-between bg-white dark:bg-gray-900 rounded p-3 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <span>
                          {conflict.conflictType === 'teacher_conflict'
                            ? '👨‍🏫 Teacher Conflict'
                            : conflict.conflictType === 'classroom_conflict'
                            ? '🏫 Classroom Conflict'
                            : '📚 Class Conflict'}
                          {' '}({conflict.dayOfWeek} {conflict.timeRange})
                        </span>
                        {expandedConflicts.has(idx) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {expandedConflicts.has(idx) && (
                        <div className="bg-white dark:bg-gray-900 rounded p-3 space-y-2 ml-2 border-l-2 border-red-300 dark:border-red-700">
                          {conflict.instances.slice(0, 5).map((instance, instIdx) => (
                            <div key={instIdx} className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {new Date(instance.date).toLocaleDateString()}
                              </span>
                              {' - '}
                              <span>{instance.conflictingClassName}</span>
                            </div>
                          ))}
                          {conflict.instances.length > 5 && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 italic pt-2">
                              ... and {conflict.instances.length - 5} more date(s)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
                <p className="text-xs text-red-700 dark:text-red-300 italic pt-2">
                  ℹ️ These dates will be skipped during lesson generation. You can reschedule other classes if needed.
                </p>
              </div>
            </div>
          )}

          {/* Summary */}
          {!hasModifications && !hasConflicts && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
              <p className="text-sm text-green-900 dark:text-green-300">
                ✓ No modifications or conflicts detected. Safe to save.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {hasModifications || hasConflicts ? 'Confirm & Save' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleChangeConfirmationDialog;
