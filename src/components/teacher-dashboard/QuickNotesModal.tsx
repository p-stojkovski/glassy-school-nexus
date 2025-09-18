import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { StickyNote, Clock, BookOpen, Save, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LessonResponse } from '@/types/api/lesson';
import { lessonApiService } from '@/services/lessonApiService';
import { toast } from 'sonner';

interface QuickNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: LessonResponse;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const QuickNotesModal: React.FC<QuickNotesModalProps> = ({
  isOpen,
  onClose,
  lesson
}) => {
  const [notes, setNotes] = useState(lesson.notes || '');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize notes when modal opens or lesson changes
  useEffect(() => {
    if (isOpen) {
      setNotes(lesson.notes || '');
      setSaveStatus('idle');
      setLastSaved(null);
    }
  }, [isOpen, lesson.notes]);

  const saveNotes = useCallback(async (notesToSave: string) => {
    if (!lesson) return;
    
    setSaveStatus('saving');
    
    try {
      // Use the existing conductLesson API which accepts notes
      // This doesn't change the lesson status, just updates the notes
      await lessonApiService.conductLesson(lesson.id, {
        notes: notesToSave.trim() || undefined
      });
      
      setSaveStatus('saved');
      setLastSaved(new Date());
      
      // Clear saved status after 2 seconds
      setTimeout(() => {
        if (saveStatus === 'saved') {
          setSaveStatus('idle');
        }
      }, 2000);
      
    } catch (error: any) {
      console.error('Error saving notes:', error);
      setSaveStatus('error');
      toast.error('Failed to save notes: ' + (error.message || 'Unknown error'));
      
      // Clear error status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  }, [lesson, saveStatus]);

  // Auto-save functionality with debounce
  useEffect(() => {
    if (!isOpen) return;
    
    const timeoutId = setTimeout(() => {
      // Only auto-save if notes have changed and are not empty
      if (notes.trim() !== (lesson.notes || '').trim() && notes.trim() !== '') {
        saveNotes(notes);
      }
    }, 1500); // Auto-save after 1.5 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [notes, isOpen, lesson.notes, saveNotes]);

  const handleManualSave = () => {
    saveNotes(notes);
  };

  const handleClose = () => {
    // Save any unsaved changes before closing
    if (notes.trim() !== (lesson.notes || '').trim() && saveStatus !== 'saving') {
      saveNotes(notes);
    }
    onClose();
  };

  const formatLessonDateTime = (lesson: LessonResponse) => {
    const date = new Date(lesson.scheduledDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });
    return `${dayName}, ${dateStr} • ${lesson.startTime} - ${lesson.endTime}`;
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />;
      case 'saved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Save className="w-4 h-4" />;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaved ? `Saved at ${lastSaved.toLocaleTimeString()}` : 'Saved';
      case 'error':
        return 'Failed to save';
      default:
        return 'Auto-save enabled';
    }
  };

  const characterCount = notes.length;
  const maxCharacters = 1000;
  const isNearLimit = characterCount > maxCharacters * 0.9;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 via-purple-900/90 to-indigo-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-purple-400" />
            Quick Lesson Notes
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Add observations and notes about this lesson
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Lesson Details */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">{lesson.className}</h4>
                <Badge className="bg-purple-500 hover:bg-purple-500 text-white">
                  {lesson.statusName}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Clock className="w-4 h-4" />
                <span>{formatLessonDateTime(lesson)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-white/70">
                <BookOpen className="w-4 h-4" />
                <span>{lesson.subjectNameSnapshot || lesson.subjectName}</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-white font-medium">Lesson Notes</label>
              <div className="flex items-center gap-2 text-sm text-white/60">
                {getSaveStatusIcon()}
                <span>{getSaveStatusText()}</span>
              </div>
            </div>
            
            <Textarea
              placeholder="Add any observations, notes, or reminders about this lesson..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none min-h-[200px] focus:border-purple-400 focus:ring-purple-400"
              rows={8}
              maxLength={maxCharacters}
            />
            
            <div className="flex items-center justify-between text-xs">
              <div className="text-white/50">
                Auto-saves as you type
              </div>
              <div className={`${isOverLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-white/50'}`}>
                {characterCount}/{maxCharacters} characters
              </div>
            </div>
            
            {isOverLimit && (
              <div className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Character limit exceeded. Please shorten your notes.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
              disabled={saveStatus === 'saving'}
            >
              Close
            </Button>
            
            <Button
              onClick={handleManualSave}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              disabled={saveStatus === 'saving' || isOverLimit || notes.trim() === (lesson.notes || '').trim()}
            >
              <div className="flex items-center gap-2">
                {saveStatus === 'saving' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Now
                  </>
                )}
              </div>
            </Button>
          </div>
          
          {/* Save Status Indicator */}
          {saveStatus === 'saved' && lastSaved && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-green-300 text-sm bg-green-500/10 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4" />
                Notes saved successfully at {lastSaved.toLocaleTimeString()}
              </div>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickNotesModal;