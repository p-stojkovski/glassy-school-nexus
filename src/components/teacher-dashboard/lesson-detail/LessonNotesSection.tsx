import React from 'react';
import { FileText } from 'lucide-react';

interface LessonNotesSectionProps {
  notes: string | null;
}

const LessonNotesSection: React.FC<LessonNotesSectionProps> = ({ notes }) => {
  const hasNotes = notes && notes.trim().length > 0;
  
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-yellow-400" />
        Lesson Notes
      </h3>
      {hasNotes ? (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-white/10 scrollbar-thumb-white/30 hover:scrollbar-thumb-white/50">
            <p className="text-white/90 whitespace-pre-wrap leading-relaxed text-sm">
              {notes.trim()}
            </p>
          </div>
          {notes.trim().split('\n').length > 8 && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-white/50 text-xs">
                Note: Long notes are scrollable
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-white/70 italic">No notes recorded for this lesson</p>
        </div>
      )}
    </div>
  );
};

export default LessonNotesSection;