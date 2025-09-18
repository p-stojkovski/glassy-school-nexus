import { useState, useEffect, useCallback } from 'react';
import { TeacherResponse } from '@/types/api/teacher';
import { ClassResponse } from '@/types/api/class';
import { teacherApiService } from '@/services/teacherApiService';
import { classApiService } from '@/services/classApiService';

const SELECTION_STORAGE_KEY = 'think-english-teacher-dashboard-selection';
const STORAGE_EXPIRY_HOURS = 24;

interface StoredSelection {
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  timestamp: number;
  expiresAt: number;
}

interface UseTeacherClassSelectionResult {
  selectedTeacher: TeacherResponse | null;
  selectedClass: ClassResponse | null;
  availableClasses: ClassResponse[];
  isLoadingClasses: boolean;
  isSelectingTeacher: boolean;
  isSelectingClass: boolean;
  error: string | null;
  setSelectedTeacher: (teacher: TeacherResponse | null) => void;
  setSelectedClass: (classItem: ClassResponse | null) => void;
  clearSelection: () => void;
  hasValidSelection: () => boolean;
  refreshSelection: () => void;
}

// Helper functions for localStorage
const getStoredSelection = (): StoredSelection | null => {
  try {
    const stored = localStorage.getItem(SELECTION_STORAGE_KEY);
    if (stored) {
      const selection = JSON.parse(stored) as StoredSelection;
      // Check if selection has expired
      if (Date.now() < selection.expiresAt) {
        return selection;
      } else {
        // Remove expired selection
        localStorage.removeItem(SELECTION_STORAGE_KEY);
      }
    }
  } catch (error) {
    console.warn('Failed to parse teacher selection from localStorage:', error);
    localStorage.removeItem(SELECTION_STORAGE_KEY);
  }
  return null;
};

const setStoredSelection = (teacher: TeacherResponse, classItem: ClassResponse): void => {
  try {
    const selection: StoredSelection = {
      teacherId: teacher.id,
      teacherName: teacher.name,
      classId: classItem.id,
      className: classItem.name,
      timestamp: Date.now(),
      expiresAt: Date.now() + (STORAGE_EXPIRY_HOURS * 60 * 60 * 1000),
    };
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(selection));
  } catch (error) {
    console.warn('Failed to store teacher selection in localStorage:', error);
  }
};

const clearStoredSelection = (): void => {
  localStorage.removeItem(SELECTION_STORAGE_KEY);
};

export const useTeacherClassSelection = (): UseTeacherClassSelectionResult => {
  const [selectedTeacher, setSelectedTeacherState] = useState<TeacherResponse | null>(null);
  const [selectedClass, setSelectedClassState] = useState<ClassResponse | null>(null);
  const [availableClasses, setAvailableClasses] = useState<ClassResponse[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isSelectingTeacher, setIsSelectingTeacher] = useState(false);
  const [isSelectingClass, setIsSelectingClass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load classes when teacher changes
  const loadClassesForTeacher = useCallback(async (teacher: TeacherResponse) => {
    if (!teacher) {
      setAvailableClasses([]);
      return;
    }

    setIsLoadingClasses(true);
    setError(null);
    
    try {
      // Search for classes assigned to this teacher
      const classes = await classApiService.searchClasses({ teacherId: teacher.id });
      setAvailableClasses(classes);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load classes for teacher';
      setError(errorMessage);
      setAvailableClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  }, []);

  // Set selected teacher and load their classes
  const setSelectedTeacher = useCallback(async (teacher: TeacherResponse | null) => {
    setIsSelectingTeacher(true);
    setSelectedTeacherState(teacher);
    setSelectedClassState(null); // Clear class when teacher changes
    setError(null);

    if (teacher) {
      await loadClassesForTeacher(teacher);
    } else {
      setAvailableClasses([]);
    }
    
    setIsSelectingTeacher(false);
  }, [loadClassesForTeacher]);

  // Set selected class and persist both selections
  const setSelectedClass = useCallback((classItem: ClassResponse | null) => {
    setIsSelectingClass(true);
    setSelectedClassState(classItem);
    
    // Persist selection if both teacher and class are selected
    if (selectedTeacher && classItem) {
      setStoredSelection(selectedTeacher, classItem);
    } else {
      clearStoredSelection();
    }
    
    setIsSelectingClass(false);
  }, [selectedTeacher]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedTeacherState(null);
    setSelectedClassState(null);
    setAvailableClasses([]);
    clearStoredSelection();
    setError(null);
  }, []);

  // Check if we have a valid selection
  const hasValidSelection = useCallback((): boolean => {
    return selectedTeacher !== null && selectedClass !== null;
  }, [selectedTeacher, selectedClass]);

  // Force refresh of the selection state
  const refreshSelection = useCallback(() => {
    // This will cause a re-render and re-evaluation of hasValidSelection
    const stored = getStoredSelection();
    if (stored && selectedTeacher && selectedClass) {
      // Selection exists in localStorage and state, just trigger re-render
      setSelectedClassState(selectedClass);
    }
  }, [selectedTeacher, selectedClass]);

  // Restore selection from localStorage on mount
  useEffect(() => {
    const restoreSelection = async () => {
      const stored = getStoredSelection();
      if (!stored) return;

      try {
        setIsSelectingTeacher(true);
        
        // Try to fetch the stored teacher
        const teacher = await teacherApiService.getTeacherById(stored.teacherId);
        setSelectedTeacherState(teacher);
        
        // Load classes for this teacher
        const classes = await classApiService.searchClasses({ teacherId: teacher.id });
        setAvailableClasses(classes);
        
        // Try to find and select the stored class
        const storedClass = classes.find(c => c.id === stored.classId);
        if (storedClass) {
          setSelectedClassState(storedClass);
        } else {
          // Class no longer exists, clear the invalid selection
          clearStoredSelection();
          console.warn('Stored class no longer exists, cleared selection');
        }
        
      } catch (err) {
        // Teacher or class no longer exists, clear the invalid selection
        console.warn('Failed to restore stored selection:', err);
        clearStoredSelection();
      } finally {
        setIsSelectingTeacher(false);
      }
    };

    restoreSelection();
  }, []);

  return {
    selectedTeacher,
    selectedClass,
    availableClasses,
    isLoadingClasses,
    isSelectingTeacher,
    isSelectingClass,
    error,
    setSelectedTeacher,
    setSelectedClass,
    clearSelection,
    hasValidSelection,
    refreshSelection,
  };
};