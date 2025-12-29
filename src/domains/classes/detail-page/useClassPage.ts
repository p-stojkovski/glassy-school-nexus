import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { classApiService } from '@/services/classApiService';
import { ClassBasicInfoResponse, ClassResponse, ClassFormData, ArchivedScheduleSlotResponse } from '@/types/api/class';

type ClassPageMode = 'view' | 'edit';
type TabId = 'lessons' | 'students' | 'schedule' | 'info';

export interface ClassPageState {
  mode: ClassPageMode;
  classData: ClassBasicInfoResponse | ClassResponse | null;
  editData: ClassFormData | null;
  activeTab: TabId;
  hasUnsavedChanges: boolean;
  loading: boolean;
  error: string | null;
  tabsWithUnsavedChanges: Set<string>;
  // Archived schedules state
  archivedSchedules: ArchivedScheduleSlotResponse[];
  loadingArchived: boolean;
  archivedSchedulesExpanded: boolean;
}

// Convert ClassBasicInfoResponse or ClassResponse to ClassFormData (stable function)
// Note: schedule and additional details may not be included in basic info response
const convertToFormData = (classData: ClassBasicInfoResponse | ClassResponse): ClassFormData => {
  // Check if this is a full ClassResponse (has description, requirements, etc.)
  const isFullResponse = 'description' in classData;

  return {
    name: classData.name,
    subjectId: classData.subjectId,
    teacherId: classData.teacherId,
    classroomId: classData.classroomId,
    description: isFullResponse ? (classData.description || '') : '',
    requirements: isFullResponse ? (classData.requirements || '') : '',
    objectives: isFullResponse ? (classData.objectives || []) : [],
    materials: isFullResponse ? (classData.materials || []) : [],
    schedule: isFullResponse ? (classData.schedule || []) : [],
    studentIds: isFullResponse ? (classData.studentIds || []) : [],
  };
};

export const useClassPage = (classId: string) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('edit') === 'true' ? 'edit' : 'view';

  const [state, setState] = useState<ClassPageState>({
    mode: initialMode,
    classData: null,
    editData: null,
    activeTab: 'lessons',
    hasUnsavedChanges: false,
    loading: classId ? true : false, // Don't show loading if no classId
    error: null,
    tabsWithUnsavedChanges: new Set(),
    archivedSchedules: [],
    loadingArchived: false,
    archivedSchedulesExpanded: false,
  });

  // Fetch class data on mount (only if classId is provided)
  useEffect(() => {
    if (!classId) {
      // Skip loading for create mode
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    const loadClassData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const data = await classApiService.getClassById(classId);

        setState((prev) => ({
          ...prev,
          classData: data,
          loading: false,
          // If URL has ?edit=true, populate editData
          editData: prev.mode === 'edit' ? convertToFormData(data) : null,
        }));
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          error: err?.message || 'Failed to load class',
          loading: false,
        }));
      }
    };

    if (classId) {
      loadClassData();
    }
  }, [classId]);

  // Enter edit mode
  const enterEditMode = useCallback(() => {
    setState((prev) => {
      if (!prev.classData) return prev;
      return {
        ...prev,
        mode: 'edit',
        editData: convertToFormData(prev.classData),
        hasUnsavedChanges: false,
      };
    });
  }, []);

  // Cancel edit mode with warning if unsaved changes
  const cancelEdit = useCallback(() => {
    setState((prev) => {
      if (prev.hasUnsavedChanges) {
        // Warning will be shown by caller
        return prev;
      }
      return {
        ...prev,
        mode: 'view',
        editData: null,
        hasUnsavedChanges: false,
      };
    });
  }, []);

  // Exit edit mode without confirmation (after warning confirmation)
  const cancelEditConfirmed = useCallback(() => {
    setState((prev) => ({
      ...prev,
      mode: 'view',
      editData: null,
      hasUnsavedChanges: false,
    }));
  }, []);

  // Update a field in edit data
  const updateField = useCallback((field: keyof ClassFormData, value: any) => {
    setState((prev) => {
      if (!prev.editData) return prev;
      return {
        ...prev,
        editData: {
          ...prev.editData,
          [field]: value,
        },
        hasUnsavedChanges: true,
      };
    });
  }, []);

  // Update nested fields (e.g., schedule array)
  const updateNestedField = useCallback((field: keyof ClassFormData, value: any[]) => {
    setState((prev) => {
      if (!prev.editData) return prev;
      return {
        ...prev,
        editData: {
          ...prev.editData,
          [field]: value,
        },
        hasUnsavedChanges: true,
      };
    });
  }, []);

  // Save changes
  const saveChanges = useCallback(async (formData: ClassFormData) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const updated = await classApiService.updateClass(classId, formData);

      setState((prev) => ({
        ...prev,
        classData: updated,
        editData: null,
        mode: 'view',
        hasUnsavedChanges: false,
        loading: false,
      }));

      toast.success('Class updated successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to update class';
      setState((prev) => ({
        ...prev,
        error: errorMsg,
        loading: false,
      }));
      toast.error(errorMsg);
      return false;
    }
  }, [classId]);

  // Set active tab
  const setActiveTab = useCallback((tab: TabId) => {
    setState((prev) => ({
      ...prev,
      activeTab: tab,
    }));
  }, []);

  // Set unsaved changes flag (for form integration)
  const setHasUnsavedChanges = useCallback((hasChanges: boolean) => {
    setState((prev) => ({
      ...prev,
      hasUnsavedChanges: hasChanges,
    }));
  }, []);

  // Refetch class data (used for inline add/remove operations)
  const refetchClassData = useCallback(async () => {
    try {
      const data = await classApiService.getClassById(classId);
      setState((prev) => ({
        ...prev,
        classData: data,
      }));
    } catch (err: any) {
      console.error('Error refetching class data:', err);
      toast.error('Failed to refresh class data');
    }
  }, [classId]);

  // Register/unregister tab unsaved changes
  const registerTabUnsavedChanges = useCallback((tabId: string, hasChanges: boolean) => {
    setState((prev) => {
      const newTabs = new Set(prev.tabsWithUnsavedChanges);
      if (hasChanges) {
        newTabs.add(tabId);
      } else {
        newTabs.delete(tabId);
      }
      return {
        ...prev,
        tabsWithUnsavedChanges: newTabs,
      };
    });
  }, []);

  // Check if can switch to a tab (no unsaved changes in any tab)
  const canSwitchTab = useCallback((targetTab: TabId): boolean => {
    return state.tabsWithUnsavedChanges.size === 0;
  }, [state.tabsWithUnsavedChanges]);

  // Check if any tab has unsaved changes
  const hasAnyUnsavedChanges = useCallback((): boolean => {
    return state.tabsWithUnsavedChanges.size > 0;
  }, [state.tabsWithUnsavedChanges]);

  // Load archived schedules (lazy loading)
  // Uses functional setState for guard checks to keep callback stable (only depends on classId)
  const loadArchivedSchedules = useCallback(async () => {
    // Use functional setState to check current state without adding dependencies
    let shouldProceed = false;
    setState((prev) => {
      if (prev.archivedSchedules.length > 0 || prev.loadingArchived) {
        return prev; // Already loaded or loading - no state change
      }
      shouldProceed = true;
      return { ...prev, loadingArchived: true };
    });

    if (!shouldProceed) return;

    try {
      const archived = await classApiService.getArchivedSchedules(classId);
      setState((prev) => ({
        ...prev,
        archivedSchedules: archived,
        loadingArchived: false,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loadingArchived: false,
      }));
      console.error('Error loading archived schedules:', err);
      toast.error('Failed to load archived schedules');
    }
  }, [classId]);

  // Toggle archived schedules expansion
  // Separated concerns: toggle state only, load triggered separately
  const toggleArchivedSchedules = useCallback(() => {
    let shouldTriggerLoad = false;
    setState((prev) => {
      const newExpanded = !prev.archivedSchedulesExpanded;
      // Check if we need to load (expanding for first time with no data)
      if (newExpanded && prev.archivedSchedules.length === 0 && !prev.loadingArchived) {
        shouldTriggerLoad = true;
      }
      return {
        ...prev,
        archivedSchedulesExpanded: newExpanded,
      };
    });
    // Trigger load outside setState (can't call async functions inside setState)
    if (shouldTriggerLoad) {
      loadArchivedSchedules();
    }
  }, [loadArchivedSchedules]);

  // Refresh archived schedules (after schedule deletion/archival)
  // Uses functional setState for guard check to keep callback stable
  const refreshArchivedSchedules = useCallback(async () => {
    let shouldProceed = false;
    setState((prev) => {
      if (!prev.archivedSchedulesExpanded) {
        return prev; // Don't refresh if not visible - no state change
      }
      shouldProceed = true;
      return { ...prev, loadingArchived: true };
    });

    if (!shouldProceed) return;

    try {
      const archived = await classApiService.getArchivedSchedules(classId);
      setState((prev) => ({
        ...prev,
        archivedSchedules: archived,
        loadingArchived: false,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loadingArchived: false,
      }));
      console.error('Error refreshing archived schedules:', err);
    }
  }, [classId]);

  return {
    // State
    ...state,

    // Actions - Edit mode
    enterEditMode,
    cancelEdit,
    cancelEditConfirmed,
    updateField,
    updateNestedField,
    saveChanges,

    // Actions - Tab management
    setActiveTab,
    setHasUnsavedChanges,
    registerTabUnsavedChanges,
    canSwitchTab,
    hasAnyUnsavedChanges,

    // Actions - Data refresh
    refetchClassData,

    // Actions - Archived schedules
    loadArchivedSchedules,
    toggleArchivedSchedules,
    refreshArchivedSchedules,
  };
};

export type UseClassPageReturn = ReturnType<typeof useClassPage>;
