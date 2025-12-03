import React from 'react';
import { StickyNote } from 'lucide-react';
import { useLessonNotesDisplay } from '../../hooks/useLessonNotesDisplay';

/**
 * System-generated note that should be hidden from UI display.
 * This note is auto-created when ending a lesson via teaching mode without explicit notes.
 */
const SYSTEM_TEACHING_MODE_NOTE = 'Lesson completed via teaching mode';

/**
 * Checks if a note is a system-generated technical note that should be hidden.
 * These notes don't provide meaningful content for teachers.
 */
const isSystemTeachingModeNote = (note?: string | null): boolean =>
  note?.trim() === SYSTEM_TEACHING_MODE_NOTE;

interface LessonNotesDisplaySectionProps {
  lessonId: string;
}

const LessonNotesDisplaySection: React.FC<LessonNotesDisplaySectionProps> = ({ lessonId }) => {
  const { notes, loading } = useLessonNotesDisplay(lessonId);
  
  // Filter out system-generated notes that aren't meaningful to teachers
  const displayNotes = notes && !isSystemTeachingModeNote(notes) ? notes : null;

  if (loading) {
    return (
      <div className="p-3 rounded-lg border border-white/5 bg-white/[0.04]">
        <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-2" />
        <div className="h-12 bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg border border-white/5 bg-white/[0.04] h-full">
      <div className="flex items-center gap-2 mb-2">
        <StickyNote className="w-4 h-4 text-yellow-400 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-white">Teacher Notes</h3>
      </div>
      {displayNotes && displayNotes.trim() !== '' ? (
        <p className="text-white/80 whitespace-pre-wrap break-words text-sm leading-relaxed">{displayNotes}</p>
      ) : (
        <p className="text-white/50 text-xs">None for this lesson.</p>
      )}
    </div>
  );
};

export default LessonNotesDisplaySection;
