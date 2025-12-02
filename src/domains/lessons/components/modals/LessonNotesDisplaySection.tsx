import React from 'react';
import { StickyNote } from 'lucide-react';
import { useLessonNotesDisplay } from '../../hooks/useLessonNotesDisplay';

interface LessonNotesDisplaySectionProps {
  lessonId: string;
}

const LessonNotesDisplaySection: React.FC<LessonNotesDisplaySectionProps> = ({ lessonId }) => {
  const { notes, loading } = useLessonNotesDisplay(lessonId);

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
      {notes && notes.trim() !== '' ? (
        <p className="text-white/80 whitespace-pre-wrap break-words text-sm leading-relaxed">{notes}</p>
      ) : (
        <p className="text-white/50 text-xs">None for this lesson.</p>
      )}
    </div>
  );
};

export default LessonNotesDisplaySection;
