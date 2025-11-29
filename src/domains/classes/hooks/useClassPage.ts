import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { classApiService } from '@/services/classApiService';
import { ClassBasicInfoResponse, ClassFormData, ArchivedScheduleSlotResponse } from '@/types/api/class';

type ClassPageMode = 'view' | 'edit';
type TabId = 'info' | 'schedule' | 'students' | 'lessons';

export interface ClassPageState {
  mode: ClassPageMode;
  classData: ClassBasicInfoResponse | null;
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

// Convert ClassBasicInfoResponse to ClassFormData (stable function)
// Note: schedule and additional details are not included in basic info response
const convertToFormData = (classData: ClassBasicInfoResponse): ClassFormData => {
  return {
    name: classData.name,
    subjectId: classData.subjectId,
    teacherId: classData.teacherId,
    classroomId: classData.classroomId,
    description: '',
    requirements: '',
    objectives: [],
    materials: [],
    schedule: [],
    studentIds: [],
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
  const loadArchivedSchedules = useCallback(async () => {
    if (state.archivedSchedules.length > 0 || state.loadingArchived) {
      return; // Already loaded or loading
    }

    setState((prev) => ({
      ...prev,
      loadingArchived: true,
    }));

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
  }, [classId, state.archivedSchedules.length, state.loadingArchived]);

  // Toggle archived schedules expansion
  const toggleArchivedSchedules = useCallback(async () => {
    setState((prev) => {
      const newExpanded = !prev.archivedSchedulesExpanded;
      // Load when expanding if not already loaded
      if (newExpanded && prev.archivedSchedules.length === 0) {
        loadArchivedSchedules();
      }
      return {
        ...prev,
        archivedSchedulesExpanded: newExpanded,
      };
    });
  }, [loadArchivedSchedules]);

  // Refresh archived schedules (after schedule deletion/archival)
  const refreshArchivedSchedules = useCallback(async () => {
    if (!state.archivedSchedulesExpanded) {
      return; // Don't refresh if not visible
    }
    setState((prev) => ({
      ...prev,
      loadingArchived: true,
    }));
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
  }, [classId, state.archivedSchedulesExpanded]);

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
