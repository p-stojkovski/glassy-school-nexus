import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import lessonStudentApiService from '@/services/lessonStudentApiService';
import { SaveStatus } from '@/types/api/lesson-students';

interface UseLessonNotesReturn {
  notes: string;
  saveStatus: SaveStatus;
  updateNotes: (notes: string) => void;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useLessonNotes = (lessonId: string): UseLessonNotesReturn => {
  const [notes, setNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const mounted = useRef(true);

  // Cleanup
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  // Fetch initial notes
  const fetchNotes = useCallback(async () => {
    if (!lessonId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await lessonStudentApiService.getLessonNotes(lessonId);
      
      if (mounted.current) {
        setNotes(result.notes || '');
      }
    } catch (err: any) {
      if (mounted.current) {
        const errorMessage = err.message || 'Failed to load lesson notes';
        setError(errorMessage);
        // Don't show toast for initial load failures
        console.error('Failed to load lesson notes:', err);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [lessonId]);

  // Load notes on mount
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Debounced save function
  const saveNotes = useCallback(async (notesToSave: string) => {
    if (!mounted.current) return;

    try {
      setSaveStatus('saving');
      await lessonStudentApiService.updateLessonNotes(lessonId, { notes: notesToSave });
      
      if (mounted.current) {
        setSaveStatus('saved');
        
        // Reset status after delay
        setTimeout(() => {
          if (mounted.current) {
            setSaveStatus('idle');
          }
        }, 2000);
      }
    } catch (err: any) {
      if (mounted.current) {
        setSaveStatus('error');
        
        toast({
          title: 'Failed to save lesson notes',
          description: err.message || 'Please try again',
          variant: 'destructive',
        });

        // Reset error status after delay
        setTimeout(() => {
          if (mounted.current) {
            setSaveStatus('idle');
          }
        }, 3000);
      }
    }
  }, [lessonId]);

  // Update notes with debounced auto-save
  const updateNotes = useCallback((newNotes: string) => {
    setNotes(newNotes);

    // Clear existing timeout
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    // Don't auto-save empty notes, just set status to idle
    if (!newNotes.trim()) {
      setSaveStatus('idle');
      return;
    }

    // Set saving status immediately for user feedback
    setSaveStatus('saving');

    // Set new timeout for debounced save (1.5 seconds)
    saveTimeout.current = setTimeout(() => {
      saveNotes(newNotes);
    }, 1500);
  }, [saveNotes]);

  return {
    notes,
    saveStatus,
    updateNotes,
    loading,
    error,
    refetch: fetchNotes,
  };
};