import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Loader2, Eye, PencilLine } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { FormSheet } from '@/components/common/sheets';
import { useLessonHomework } from '../hooks/useLessonHomework';
import lessonApiService from '@/services/lessonApiService';

type HomeworkSheetMode = 'view' | 'assign';

interface HomeworkSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLessonId: string;
  classId: string;
  initialMode: HomeworkSheetMode;
  disabled?: boolean;
  onSuccess?: () => void;
}

/**
 * Tabbed control for switching between viewing current homework
 * and assigning homework for the next lesson.
 * Styled to match the Edit Teacher sidebar tabs.
 */
const HomeworkModeToggle: React.FC<{
  mode: HomeworkSheetMode;
  onModeChange: (mode: HomeworkSheetMode) => void;
  isAssignDisabled: boolean;
  disabledReason?: string;
}> = ({ mode, onModeChange, isAssignDisabled, disabledReason }) => (
  <Tabs
    value={mode}
    onValueChange={(value) => {
      if (value === 'assign' && isAssignDisabled) return;
      onModeChange(value as HomeworkSheetMode);
    }}
    className="mb-4"
  >
    <TabsList className="bg-white/10 border-white/20 w-full grid grid-cols-2">
      <TabsTrigger
        value="view"
        className="data-[state=active]:bg-white/20 text-white justify-center"
      >
        <Eye className="w-4 h-4 mr-2" />
        View Current
      </TabsTrigger>
      <TabsTrigger
        value="assign"
        disabled={isAssignDisabled}
        title={isAssignDisabled ? disabledReason : undefined}
        className={cn(
          "data-[state=active]:bg-white/20 text-white justify-center",
          isAssignDisabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <PencilLine className="w-4 h-4 mr-2" />
        Assign Next
      </TabsTrigger>
    </TabsList>
  </Tabs>
);


export function HomeworkSheet({
  open,
  onOpenChange,
  currentLessonId,
  classId,
  initialMode,
  disabled = false,
  onSuccess,
}: HomeworkSheetProps) {
  // Mode state
  const [mode, setMode] = useState<HomeworkSheetMode>(initialMode);

  // Next lesson state
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [loadingNextLesson, setLoadingNextLesson] = useState(false);
  const [nextLessonError, setNextLessonError] = useState<string | null>(null);

  // Text for next-lesson homework textarea
  const [nextLessonHomework, setNextLessonHomework] = useState('');
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Hook instances for current and next lesson
  const currentLesson = useLessonHomework(currentLessonId);
  const nextLesson = useLessonHomework(nextLessonId || '');

  // Reset mode when sheet opens
  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  // Fetch next lesson for the class
  const fetchNextLesson = useCallback(async () => {
    if (!classId) return;
    setLoadingNextLesson(true);
    setNextLessonError(null);
    try {
      const result = await lessonApiService.getNextLesson(classId);

      // If API returns current lesson, treat as no upcoming lesson
      if (result.id === currentLessonId) {
        setNextLessonError('No upcoming lesson found for this class.');
        setNextLessonId(null);
        return;
      }

      setNextLessonId(result.id);
    } catch (err: any) {
      setNextLessonError(err?.message || 'Failed to load next lesson');
      setNextLessonId(null);
    } finally {
      setLoadingNextLesson(false);
    }
  }, [classId, currentLessonId]);

  // Fetch next lesson on sheet open
  useEffect(() => {
    if (open && classId) {
      void fetchNextLesson();
    }
  }, [open, classId, fetchNextLesson]);

  // When next-lesson homework loads, reflect in textarea
  useEffect(() => {
    if (mode === 'assign' && nextLesson.homework) {
      const text = nextLesson.homework.description || '';
      setNextLessonHomework(text);
    }
  }, [nextLesson.homework, mode]);

  // Save homework and close sheet on success
  const saveHomework = useCallback(async () => {
    if (!nextLessonId) return;

    const trimmed = nextLessonHomework.trim();

    // Ensure hook is in editing mode
    if (!nextLesson.isEditing) {
      nextLesson.startEditing();
    }
    nextLesson.updateField('description', trimmed);

    setIsSaving(true);
    try {
      await nextLesson.saveHomework();
      setHasPendingChanges(false);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error handled by hook, keep sheet open
    } finally {
      setIsSaving(false);
    }
  }, [nextLesson, nextLessonHomework, nextLessonId, onOpenChange, onSuccess]);

  // Handle mode change
  const handleModeChange = useCallback((newMode: HomeworkSheetMode) => {
    setMode(newMode);
  }, []);

  // Handle homework text change (no auto-save)
  const handleHomeworkChange = useCallback((value: string) => {
    setNextLessonHomework(value);
    setHasPendingChanges(true);
  }, []);

  // Handle sheet close via Cancel button (FormSheet handles isDirty warning)
  const handleCancel = useCallback(() => {
    setHasPendingChanges(false);
    onOpenChange(false);
  }, [onOpenChange]);

  // Handle confirm action based on mode
  const handleConfirm = useCallback(async () => {
    if (mode === 'view') {
      // View mode: just close
      onOpenChange(false);
    } else {
      // Assign mode: save then close (saveHomework handles closing)
      await saveHomework();
    }
  }, [mode, onOpenChange, saveHomework]);

  // Determine sheet title based on mode
  const sheetTitle = mode === 'view' ? 'Homework for This Lesson' : 'Assign Homework for Next Lesson';
  const sheetDescription = mode === 'view'
    ? 'Homework that was assigned for students to complete before this lesson'
    : 'Set the homework assignment for the next scheduled lesson';

  // Dynamic button text based on mode
  const confirmText = mode === 'view' ? 'Close' : (isSaving ? 'Saving...' : 'Save Changes');
  const cancelText = mode === 'view' ? '' : 'Cancel';

  return (
    <FormSheet
      open={open}
      onOpenChange={handleCancel}
      intent="primary"
      size="md"
      icon={BookOpen}
      title={sheetTitle}
      description={sheetDescription}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={handleConfirm}
      isLoading={isSaving}
      disabled={mode === 'assign' && (!hasPendingChanges || disabled)}
      isDirty={mode === 'assign' && hasPendingChanges}
    >
      <div className="space-y-4">
        {/* Mode Toggle */}
        <HomeworkModeToggle
          mode={mode}
          onModeChange={handleModeChange}
          isAssignDisabled={!!nextLessonError}
          disabledReason={nextLessonError ?? undefined}
        />

        {mode === 'view' ? (
          // View Mode: Current lesson's homework (read-only)
          <div className="space-y-2">
            {currentLesson.loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-white/50" />
              </div>
            ) : currentLesson.homework?.description?.trim() ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-white/80 text-sm whitespace-pre-wrap">
                  {currentLesson.homework.description}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-white/50 text-sm">No homework was assigned for this lesson</p>
              </div>
            )}
          </div>
        ) : (
          // Assign Mode: Next lesson's homework (editable)
          <div className="space-y-3">
            {loadingNextLesson ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-white/50" />
                <span className="ml-2 text-white/50 text-sm">Loading next lesson...</span>
              </div>
            ) : nextLessonError ? (
              <div className="text-center py-8 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-300 text-sm">{nextLessonError}</p>
              </div>
            ) : (
              <Textarea
                value={nextLessonHomework}
                onChange={(e) => handleHomeworkChange(e.target.value)}
                placeholder="Enter homework assignment for the next lesson..."
                rows={8}
                aria-label="Homework assignment for next lesson"
                className={cn(
                  "bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 resize-none",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                disabled={disabled || isSaving}
              />
            )}
          </div>
        )}
      </div>
    </FormSheet>
  );
}
