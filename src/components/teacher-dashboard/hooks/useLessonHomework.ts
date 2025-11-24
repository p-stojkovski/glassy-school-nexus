import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchHomeworkAssignment,
  createHomeworkAssignment,
  updateHomeworkAssignment,
  deleteHomeworkAssignment,
  setCurrentLessonContext,
  selectCurrentHomeworkAssignment,
  selectHomeworkLoadingStates,
  selectHomeworkError,
  clearError
} from '@/store/slices/homeworkSlice';
import {
  HomeworkAssignmentResponse,
  HomeworkAssignmentFormData,
  CreateHomeworkAssignmentRequest,
  UpdateHomeworkAssignmentRequest,
} from '@/types/api/homework';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseLessonHomeworkReturn {
  homework: HomeworkAssignmentResponse | null;
  loading: boolean;
  error: string | null;
  saveStatus: SaveStatus;
  isEditing: boolean;
  formData: HomeworkAssignmentFormData;
  startEditing: () => void;
  cancelEditing: () => void;
  updateField: (field: keyof HomeworkAssignmentFormData, value: string) => void;
  saveHomework: () => Promise<void>;
  deleteHomework: () => Promise<void>;
}

const initialFormData: HomeworkAssignmentFormData = {
  description: '',
};

export const useLessonHomework = (lessonId: string): UseLessonHomeworkReturn => {
  const dispatch = useAppDispatch();

  // Redux state - use lesson-specific selector to avoid conflicts when multiple hooks exist
  const homework = useAppSelector(state => {
    if (!lessonId || lessonId.trim() === '') return null;
    const value = state.homework.assignmentsByLessonId[lessonId] || null;
    console.log('[useLessonHomework] selector read:', { lessonId, hasValue: !!value, allKeys: Object.keys(state.homework.assignmentsByLessonId) });
    return value;
  });
  const loadingStates = useAppSelector(selectHomeworkLoadingStates);
  const reduxError = useAppSelector(selectHomeworkError);

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<HomeworkAssignmentFormData>(initialFormData);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Fetch homework on mount or when lessonId changes
  useEffect(() => {
    if (!lessonId || lessonId.trim() === '') return;

    dispatch(setCurrentLessonContext(lessonId));
    dispatch(fetchHomeworkAssignment(lessonId));
  }, [lessonId, dispatch]);

  // Initialize form data when homework changes
  useEffect(() => {
    if (homework && !isEditing) {
      setFormData({
        description: homework.description || '',
      });
    }
  }, [homework, isEditing]);

  // Update local error state when Redux error changes
  useEffect(() => {
    if (reduxError) {
      setError(reduxError);
      setSaveStatus('error');
      const timer = setTimeout(() => {
        dispatch(clearError());
        setError(null);
        setSaveStatus('idle');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [reduxError, dispatch]);

  const updateField = useCallback((field: keyof HomeworkAssignmentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const saveHomeworkInternal = useCallback(async (dataToSave: HomeworkAssignmentFormData) => {
    if (!lessonId || lessonId.trim() === '') return;

    // Validation - description is required in the simplified model
    const trimmedDescription = dataToSave.description.trim();

    setSaveStatus('saving');
    setError(null);

    try {
      let resultAction;
      
      // Read homework state fresh from Redux at execution time to avoid stale closure
      const currentHomework = homework;
      
      console.log('[useLessonHomework] Save decision:', {
        lessonId,
        hasHomework: !!currentHomework,
        homework: currentHomework,
        willUpdate: !!currentHomework
      });

      if (!trimmedDescription) {
        // Treat empty description as delete
        resultAction = await dispatch(deleteHomeworkAssignment(lessonId));
        setFormData(initialFormData);
        setIsEditing(false);
      } else if (currentHomework) {
        // Update existing homework (description-only)
        const updateRequest: UpdateHomeworkAssignmentRequest = {
          description: trimmedDescription,
        };

        resultAction = await dispatch(
          updateHomeworkAssignment({ lessonId, request: updateRequest })
        );
      } else {
        // Create new homework (description-only)
        const createRequest: CreateHomeworkAssignmentRequest = {
          description: trimmedDescription,
        };

        resultAction = await dispatch(
          createHomeworkAssignment({ lessonId, request: createRequest })
        );
      }

      // Check if action was successful
      if (resultAction.payload) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else if (resultAction.error) {
        setError(resultAction.error.message || 'Failed to save homework');
        setSaveStatus('error');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save homework');
      setSaveStatus('error');
    }
  }, [homework, lessonId, dispatch]); // homework must stay in deps to recreate callback when it changes

  const saveHomework = useCallback(async () => {
    await saveHomeworkInternal(formData);
  }, [formData, saveHomeworkInternal]);

  const startEditing = useCallback(() => {
    // Initialize form with current homework data or empty
    if (homework) {
      setFormData({
        description: homework.description || '',
      });
    } else {
      setFormData(initialFormData);
    }
    setIsEditing(true);
  }, [homework]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setFormData(initialFormData);
    setSaveStatus('idle');
    setError(null);
  }, []);

  const deleteHomework = useCallback(async () => {
    // Placeholder for delete functionality
    // Can be implemented if needed
    console.log('Delete homework not yet implemented');
  }, []);

  return {
    homework: homework || null,
    loading: loadingStates.fetchingAssignment,
    error,
    saveStatus,
    isEditing,
    formData,
    startEditing,
    cancelEditing,
    updateField,
    saveHomework,
    deleteHomework
  };
};
