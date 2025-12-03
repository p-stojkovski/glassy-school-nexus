import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BookOpen, Loader2, ChevronRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useLessonHomework } from '../hooks/useLessonHomework';
import lessonApiService from '@/services/lessonApiService';
import { LessonResponse } from '@/types/api/lesson';
import DashboardLoadingState from '../states/DashboardLoadingState';

interface LessonHomeworkSectionProps {
  lessonId: string;
  classId: string;
  isLoading?: boolean;
  isEditingMode?: boolean;
}

const LessonHomeworkSection: React.FC<LessonHomeworkSectionProps> = ({
  lessonId,
  classId,
  isLoading = false,
  isEditingMode = false
}) => {
  const {
    homework,
    loading,
    error
  } = useLessonHomework(lessonId);

  // Toggle for editing homework for next lesson
  const [showNextLessonInput, setShowNextLessonInput] = useState(false);
  // Next lesson context
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [loadingNextLesson, setLoadingNextLesson] = useState(false);
  const [nextLessonError, setNextLessonError] = useState<string | null>(null);
  // Text for next-lesson homework textarea (UI unchanged)
  const [nextLessonHomework, setNextLessonHomework] = useState('');
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [nextLessonSaveStatus, setNextLessonSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Hook instance managing persistence for the next lesson (created once we know the ID)
  const nextLesson = useLessonHomework(nextLessonId || '');

  const getSaveStatusIndicator = (status: string) => {
    switch (status) {
      case 'saving':
        return (
          <div className="inline-flex items-center gap-1 text-xs text-blue-300">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </div>
        );
      case 'saved':
        return (
          <div className="inline-flex items-center gap-1 text-xs text-green-300">
            ✓ Saved
          </div>
        );
      case 'error':
        return (
          <div className="inline-flex items-center gap-1 text-xs text-red-300">
            ⚠ Error
          </div>
        );
      default:
        return null;
    }
  };

// Fetch next lesson for the class when toggling into "Next Lesson" view
const fetchNextLesson = async () => {
  if (!classId) return;
  setLoadingNextLesson(true);
  setNextLessonError(null);
  try {
    const result: LessonResponse = await lessonApiService.getNextLesson(classId);

    // Defensive: if API mistakenly returns the current lesson, treat as no upcoming lesson
    if (result.id === lessonId) {
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
};

// Fetch next lesson on component initialization
useEffect(() => {
  if (!classId) return;
  void fetchNextLesson();
}, [classId]);

// Keep save status indicator in sync with the hook
useEffect(() => {
  setNextLessonSaveStatus(nextLesson.saveStatus);
}, [nextLesson.saveStatus]);

// When the next-lesson homework loads or changes, reflect it in the textarea
useEffect(() => {
  if (showNextLessonInput) {
    const text = nextLesson.homework?.description || '';
    if (text !== undefined) {
      setNextLessonHomework(text);
    }
  }
}, [nextLesson.homework, showNextLessonInput]);

// Persist any pending edits immediately (used on blur/toggle)
const flushNextLessonHomework = useCallback(async () => {
  if (!nextLessonId) return;

  if (!hasPendingChanges) return;

  const trimmed = nextLessonHomework.trim();

  // Clear pending debounce to avoid duplicate call
  if (autoSaveTimeoutRef.current) {
    clearTimeout(autoSaveTimeoutRef.current);
  }

  // Ensure hook is in editing mode and has latest text
  if (!nextLesson.isEditing) {
    nextLesson.startEditing();
  }
  nextLesson.updateField('description', trimmed);

  setNextLessonSaveStatus('saving');
  try {
    await nextLesson.saveHomework();
    setHasPendingChanges(false);
  } catch {
    setNextLessonSaveStatus('error');
  }
}, [hasPendingChanges, nextLesson, nextLessonHomework, nextLessonId]);

// Toggle handler that triggers loading the next lesson on first open
const handleToggleNextLesson = async () => {
  const newState = !showNextLessonInput;

  // If we are closing the next-lesson editor, flush any unsaved changes
  if (showNextLessonInput && newState === false && hasPendingChanges) {
    await flushNextLessonHomework();
  }

  setShowNextLessonInput(newState);
  if (newState && !nextLessonId && !loadingNextLesson) {
    void fetchNextLesson();
  }
};

// Auto-save handler with debouncing (uses nextLesson hook for persistence)
const handleHomeworkChange = (value: string) => {
  setNextLessonHomework(value);
  setHasPendingChanges(true);

  // Only process if we have a valid next lesson ID
  if (!nextLessonId) {
    // Just update the textarea, don't persist yet
    return;
  }

  // Ensure we're in editing mode so hook auto-save can execute
  if (!nextLesson.isEditing) {
    nextLesson.startEditing();
  }

  // Update description field; actual save is debounced below
  nextLesson.updateField('description', value);

  // Debounce save
  if (autoSaveTimeoutRef.current) {
    clearTimeout(autoSaveTimeoutRef.current);
  }
  autoSaveTimeoutRef.current = setTimeout(() => {
    setNextLessonSaveStatus('saving');
    nextLesson
      .saveHomework()
      .then(() => setHasPendingChanges(false))
      .catch(() => setNextLessonSaveStatus('error'));
  }, 2000);
};

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <DashboardLoadingState
        rows={4}
        className="bg-white/5 rounded-lg border border-white/10 h-full"
      />
    );
  }

  return (
    <div className="bg-white/5 rounded-lg border border-white/[0.05]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/[0.05]">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            Homework
          </h3>
          {/* Toggle for next lesson */}
          <button
            onClick={handleToggleNextLesson}
            disabled={nextLessonError !== null && !showNextLessonInput}
            title={nextLessonError && !showNextLessonInput ? nextLessonError : undefined}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
              showNextLessonInput
                ? 'bg-blue-600 text-white'
                : nextLessonError !== null
                  ? 'bg-white/10 text-white/40 cursor-not-allowed opacity-50'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            <span>
              {showNextLessonInput
                ? 'Current Lesson'
                : isEditingMode
                  ? 'Set homework for upcoming lesson'
                  : 'Set homework for next lesson'
              }
            </span>
            <ChevronRight
              className={`w-3 h-3 transition-transform ${
                showNextLessonInput ? 'rotate-90' : ''
              }`}
            />
          </button>
        </div>
        {showNextLessonInput && getSaveStatusIndicator(nextLessonSaveStatus) && (
          <div className="mt-2">
            {getSaveStatusIndicator(nextLessonSaveStatus)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        {!showNextLessonInput && (
          <>
            {/* Read-only Current Homework */}
            {homework ? (
              <div className="space-y-2">
                {homework.description && (
                  <div>
                    <p className="text-white/80 text-xs whitespace-pre-wrap max-h-24 overflow-y-auto">
                      {homework.description}
                    </p>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-3 text-center">
                <p className="text-white/60 text-xs">No homework assigned for this lesson</p>
                <p className="text-white/40 text-xs mt-1">Use the toggle above to add homework for the next lesson</p>
              </div>
            )}
          </>
        )}

        {showNextLessonInput && (
          <div className="flex flex-col">
            {/* Keep UI identical; logic now persists to backend */}
            <Textarea
              value={nextLessonHomework}
              onChange={(e) => handleHomeworkChange(e.target.value)}
              onBlur={() => void flushNextLessonHomework()}
              placeholder="Add homework for next lesson..."
              rows={3}
              className={`
                bg-white/10 border-white/20 text-white placeholder:text-white/60 
                resize-none text-sm
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                ${nextLessonSaveStatus === 'saving' ? 'border-blue-500/50' : ''}
                ${nextLessonSaveStatus === 'error' ? 'border-red-500/50' : ''}
                ${nextLessonSaveStatus === 'saved' ? 'border-green-500/50' : ''}
              `}
              disabled={isLoading}
            />
            {/* Optional: reflect next-lesson loading/errors without altering layout */}
            {loadingNextLesson && (
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-blue-300">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading next lesson...
              </div>
            )}
            {nextLessonError && (
              <div className="mt-2 text-xs text-red-300">{nextLessonError}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonHomeworkSection;
