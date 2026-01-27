import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setFeeTemplates, setLoadingState, setError } from '@/domains/classes/classesSlice';
import classFeesApiService from '@/services/classFeesApiService';
import type {
  ClassFeeTemplate,
  CreateClassFeeTemplateRequest,
  UpdateClassFeeTemplateRequest,
} from '@/types/api/classFees';
import { toast } from 'sonner';

// Module-level in-flight tracking to prevent duplicate fetches (survives React StrictMode remounts)
const templatesInFlight = new Set<string>();

interface UseFeeTemplatesOptions {
  classId: string;
  isActive: boolean;
}

export const useFeeTemplates = ({ classId, isActive }: UseFeeTemplatesOptions) => {
  const dispatch = useAppDispatch();
  const [hasFetched, setHasFetched] = useState(false);

  // Synchronous gating to prevent duplicate network calls
  const templatesRequestedRef = useRef(false);

  // Dialog state
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ClassFeeTemplate | null>(null);

  const feeTemplates = useAppSelector((state) => state.classes.feeTemplates.items);
  const loading = useAppSelector((state) => state.classes.loading.fetchingFeeTemplates);
  const error = useAppSelector((state) => state.classes.errors.fetchFeeTemplates);

  const fetchFeeTemplates = useCallback(async () => {
    if (!classId || templatesInFlight.has(classId)) return;

    templatesRequestedRef.current = true;
    templatesInFlight.add(classId);
    dispatch(setLoadingState({ operation: 'fetchingFeeTemplates', loading: true }));
    dispatch(setError({ operation: 'fetchFeeTemplates', error: null }));

    try {
      const templates = await classFeesApiService.getTemplates(classId);
      dispatch(setFeeTemplates(templates));
      setHasFetched(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load fee templates';
      dispatch(setError({ operation: 'fetchFeeTemplates', error: message }));
    } finally {
      templatesInFlight.delete(classId);
      dispatch(setLoadingState({ operation: 'fetchingFeeTemplates', loading: false }));
    }
  }, [classId, dispatch]);

  // Reset local gating when switching classes
  useEffect(() => {
    templatesRequestedRef.current = false;
    setHasFetched(false);
  }, [classId]);

  // Fetch templates on tab activation
  useEffect(() => {
    if (isActive && !templatesRequestedRef.current && !loading) {
      fetchFeeTemplates();
    }
    // Exclude fetchFeeTemplates - it's stable in behavior but unstable in reference
  }, [isActive, loading]);

  // Dialog handlers
  const openCreateSheet = useCallback(() => {
    setShowCreateSheet(true);
  }, []);

  const openEditDialog = useCallback((template: ClassFeeTemplate) => {
    setSelectedTemplate(template);
    setShowEditDialog(true);
  }, []);

  const openDeleteDialog = useCallback((template: ClassFeeTemplate) => {
    setSelectedTemplate(template);
    setShowDeleteDialog(true);
  }, []);

  const closeDialogs = useCallback(() => {
    setShowCreateSheet(false);
    setShowEditDialog(false);
    setShowDeleteDialog(false);
    setSelectedTemplate(null);
  }, []);

  // CRUD operation handlers
  const handleCreateTemplate = useCallback(async (data: CreateClassFeeTemplateRequest) => {
    if (!classId) return;

    dispatch(setLoadingState({ operation: 'creatingFeeTemplate', loading: true }));
    dispatch(setError({ operation: 'createFeeTemplate', error: null }));

    try {
      await classFeesApiService.createTemplate(classId, data);
      toast.success('Fee template created successfully');

      // Refresh templates
      await fetchFeeTemplates();

      closeDialogs();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create fee template';
      dispatch(setError({ operation: 'createFeeTemplate', error: message }));
      toast.error(message);
      throw err; // Re-throw so dialog can handle loading state
    } finally {
      dispatch(setLoadingState({ operation: 'creatingFeeTemplate', loading: false }));
    }
  }, [classId, dispatch, fetchFeeTemplates, closeDialogs]);

  const handleUpdateTemplate = useCallback(async (data: UpdateClassFeeTemplateRequest) => {
    if (!classId || !selectedTemplate) return;

    dispatch(setLoadingState({ operation: 'updatingFeeTemplate', loading: true }));
    dispatch(setError({ operation: 'updateFeeTemplate', error: null }));

    try {
      await classFeesApiService.updateTemplate(classId, selectedTemplate.id, data);
      toast.success('Fee template updated successfully');

      // Refresh templates
      await fetchFeeTemplates();

      closeDialogs();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update fee template';
      dispatch(setError({ operation: 'updateFeeTemplate', error: message }));
      toast.error(message);
      throw err;
    } finally {
      dispatch(setLoadingState({ operation: 'updatingFeeTemplate', loading: false }));
    }
  }, [classId, selectedTemplate, dispatch, fetchFeeTemplates, closeDialogs]);

  const handleDeleteTemplate = useCallback(async () => {
    if (!classId || !selectedTemplate) return;

    dispatch(setLoadingState({ operation: 'deletingFeeTemplate', loading: true }));
    dispatch(setError({ operation: 'deleteFeeTemplate', error: null }));

    try {
      await classFeesApiService.deleteTemplate(classId, selectedTemplate.id);
      toast.success('Fee template deleted successfully');

      // Refresh templates
      await fetchFeeTemplates();

      closeDialogs();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete fee template';
      dispatch(setError({ operation: 'deleteFeeTemplate', error: message }));
      toast.error(message);
      throw err;
    } finally {
      dispatch(setLoadingState({ operation: 'deletingFeeTemplate', loading: false }));
    }
  }, [classId, selectedTemplate, dispatch, fetchFeeTemplates, closeDialogs]);

  // Get loading states for CRUD operations
  const createLoading = useAppSelector((state) => state.classes.loading.creatingFeeTemplate);
  const updateLoading = useAppSelector((state) => state.classes.loading.updatingFeeTemplate);
  const deleteLoading = useAppSelector((state) => state.classes.loading.deletingFeeTemplate);

  return {
    feeTemplates,
    loading,
    error,
    hasFetched,
    refetch: () => {
      templatesRequestedRef.current = false;
      fetchFeeTemplates();
    },
    // Dialog state
    showCreateSheet,
    showEditDialog,
    showDeleteDialog,
    selectedTemplate,
    openCreateSheet,
    openEditDialog,
    openDeleteDialog,
    closeDialogs,
    // CRUD handlers
    handleCreateTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    createLoading,
    updateLoading,
    deleteLoading,
  };
};
