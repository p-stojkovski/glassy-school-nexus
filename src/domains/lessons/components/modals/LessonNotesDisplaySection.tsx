import React from 'react';
import { StickyNote, AlertCircle } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { useLessonNotesDisplay } from '../../hooks/useLessonNotesDisplay';

interface LessonNotesDisplaySectionProps {
  lessonId: string;
}

const LessonNotesDisplaySection: React.FC<LessonNotesDisplaySectionProps> = ({ lessonId }) => {
  const { notes, loading } = useLessonNotesDisplay(lessonId);

  if (loading) {
    return (
      <GlassCard className="p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-12 bg-white/10 rounded animate-pulse" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <StickyNote className="w-4 h-4 text-yellow-400 flex-shrink-0" />
        <h3 className="text-sm font-medium text-white">Teacher Notes</h3>
      </div>
      {notes && notes.trim() !== '' ? (
        <p className="text-white/80 whitespace-pre-wrap break-words text-sm line-clamp-6">{notes}</p>
      ) : (
        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
          <AlertCircle className="w-3 h-3 text-white/50 flex-shrink-0" />
          <p className="text-white/50 text-xs">No notes added for this lesson</p>
        </div>
      )}
    </GlassCard>
  );
};

export default LessonNotesDisplaySection;
