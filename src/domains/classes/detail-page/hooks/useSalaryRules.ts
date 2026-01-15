import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSalaryRules, setSalaryPreview, setLoadingState, setError } from '@/domains/classes/classesSlice';
import { classApiService } from '@/services/classApiService';
import { ClassSalaryRule, CreateSalaryRuleRequest, UpdateSalaryRuleRequest } from '@/domains/classes/_shared/types/salaryRule.types';
import { toast } from 'sonner';

// Module-level in-flight tracking to prevent duplicate fetches (survives React StrictMode remounts)
const rulesInFlight = new Set<string>();
const previewInFlight = new Set<string>();

interface UseSalaryRulesOptions {
  classId: string;
  isActive: boolean;
}

export const useSalaryRules = ({ classId, isActive }: UseSalaryRulesOptions) => {
  const dispatch = useAppDispatch();
  const [hasFetched, setHasFetched] = useState(false);
  const [hasFetchedPreview, setHasFetchedPreview] = useState(false);

  // Synchronous gating to prevent duplicate network calls caused by effect re-triggers
  // (e.g., Redux loading flips before local hasFetched updates).
  const rulesRequestedRef = useRef(false);
  const previewRequestedKeyRef = useRef<string | null>(null);

  // State for month/year selection (default to current)
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-based

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ClassSalaryRule | null>(null);

  const salaryRules = useAppSelector((state) => state.classes.salaryRules.items);
  const loading = useAppSelector((state) => state.classes.loading.fetchingSalaryRules);
  const error = useAppSelector((state) => state.classes.errors.fetchSalaryRules);

  const salaryPreview = useAppSelector((state) => state.classes.salaryPreview.data);
  const previewLoading = useAppSelector((state) => state.classes.loading.fetchingSalaryPreview);
  const previewError = useAppSelector((state) => state.classes.errors.fetchSalaryPreview);

  const fetchSalaryRules = useCallback(async () => {
    if (!classId || rulesInFlight.has(classId)) return;

    rulesRequestedRef.current = true;
    rulesInFlight.add(classId);
    dispatch(setLoadingState({ operation: 'fetchingSalaryRules', loading: true }));
    dispatch(setError({ operation: 'fetchSalaryRules', error: null }));

    try {
      const rules = await classApiService.getSalaryRules(classId);
      dispatch(setSalaryRules(rules));
      setHasFetched(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load salary rules';
      dispatch(setError({ operation: 'fetchSalaryRules', error: message }));
    } finally {
      rulesInFlight.delete(classId);
      dispatch(setLoadingState({ operation: 'fetchingSalaryRules', loading: false }));
    }
  }, [classId, dispatch]);

  const fetchSalaryPreview = useCallback(async (year: number, month: number) => {
    const previewKey = `${classId}-${year}-${month}`;
    if (!classId || previewInFlight.has(previewKey)) return;

    previewRequestedKeyRef.current = previewKey;
    previewInFlight.add(previewKey);
    dispatch(setLoadingState({ operation: 'fetchingSalaryPreview', loading: true }));
    dispatch(setError({ operation: 'fetchSalaryPreview', error: null }));

    try {
      const preview = await classApiService.getSalaryPreview(classId, year, month);
      dispatch(setSalaryPreview(preview));
      setHasFetchedPreview(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load salary preview';
      dispatch(setError({ operation: 'fetchSalaryPreview', error: message }));
    } finally {
      previewInFlight.delete(previewKey);
      dispatch(setLoadingState({ operation: 'fetchingSalaryPreview', loading: false }));
    }
  }, [classId, dispatch]);

  // Reset local gating when switching classes
  useEffect(() => {
    rulesRequestedRef.current = false;
    previewRequestedKeyRef.current = null;
    setHasFetched(false);
    setHasFetchedPreview(false);
  }, [classId]);

  // Fetch rules on tab activation
  useEffect(() => {
    if (isActive && !rulesRequestedRef.current && !loading) {
      fetchSalaryRules();
    }
     
    // Exclude fetchSalaryRules - it's stable in behavior but unstable in reference, causing double-fetch
  }, [isActive, loading]);

  // Reset hasFetchedPreview when month/year changes to allow refetch
  useEffect(() => {
    previewRequestedKeyRef.current = null;
    setHasFetchedPreview(false);
  }, [selectedYear, selectedMonth]);

  // Fetch preview when tab is active or month/year changes
  useEffect(() => {
    if (!isActive || previewLoading) return;

    const previewKey = `${classId}-${selectedYear}-${selectedMonth}`;
    if (previewRequestedKeyRef.current === previewKey) return;

    fetchSalaryPreview(selectedYear, selectedMonth);
     
    // Exclude fetchSalaryPreview - it's stable in behavior but unstable in reference, causing double-fetch
  }, [isActive, classId, selectedYear, selectedMonth, previewLoading]);

  // Dialog handlers
  const openCreateDialog = useCallback(() => {
    setShowCreateDialog(true);
  }, []);

  const openEditDialog = useCallback((rule: ClassSalaryRule) => {
    setSelectedRule(rule);
    setShowEditDialog(true);
  }, []);

  const openDeleteDialog = useCallback((rule: ClassSalaryRule) => {
    setSelectedRule(rule);
    setShowDeleteDialog(true);
  }, []);

  const closeDialogs = useCallback(() => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setShowDeleteDialog(false);
    setSelectedRule(null);
  }, []);

  // CRUD operation handlers
  const handleCreateRule = useCallback(async (data: CreateSalaryRuleRequest) => {
    if (!classId) return;

    dispatch(setLoadingState({ operation: 'creatingSalaryRule', loading: true }));
    dispatch(setError({ operation: 'createSalaryRule', error: null }));

    try {
      await classApiService.createSalaryRule(classId, data);
      toast.success('Salary rule created successfully');

      // Refresh both rules and preview
      await fetchSalaryRules();
      await fetchSalaryPreview(selectedYear, selectedMonth);

      closeDialogs();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create salary rule';
      dispatch(setError({ operation: 'createSalaryRule', error: message }));
      toast.error(message);
      throw err; // Re-throw so dialog can handle loading state
    } finally {
      dispatch(setLoadingState({ operation: 'creatingSalaryRule', loading: false }));
    }
  }, [classId, dispatch, fetchSalaryRules, fetchSalaryPreview, selectedYear, selectedMonth, closeDialogs]);

  const handleUpdateRule = useCallback(async (data: UpdateSalaryRuleRequest) => {
    if (!classId || !selectedRule) return;

    dispatch(setLoadingState({ operation: 'updatingSalaryRule', loading: true }));
    dispatch(setError({ operation: 'updateSalaryRule', error: null }));

    try {
      await classApiService.updateSalaryRule(classId, selectedRule.id, data);
      toast.success('Salary rule updated successfully');

      // Refresh both rules and preview
      await fetchSalaryRules();
      await fetchSalaryPreview(selectedYear, selectedMonth);

      closeDialogs();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update salary rule';
      dispatch(setError({ operation: 'updateSalaryRule', error: message }));
      toast.error(message);
      throw err; // Re-throw so dialog can handle loading state
    } finally {
      dispatch(setLoadingState({ operation: 'updatingSalaryRule', loading: false }));
    }
  }, [classId, selectedRule, dispatch, fetchSalaryRules, fetchSalaryPreview, selectedYear, selectedMonth, closeDialogs]);

  const handleDeleteRule = useCallback(async () => {
    if (!classId || !selectedRule) return;

    dispatch(setLoadingState({ operation: 'deletingSalaryRule', loading: true }));
    dispatch(setError({ operation: 'deleteSalaryRule', error: null }));

    try {
      await classApiService.deleteSalaryRule(classId, selectedRule.id);
      toast.success('Salary rule deleted successfully');

      // Refresh both rules and preview
      await fetchSalaryRules();
      await fetchSalaryPreview(selectedYear, selectedMonth);

      closeDialogs();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete salary rule';
      dispatch(setError({ operation: 'deleteSalaryRule', error: message }));
      toast.error(message);
      throw err; // Re-throw so dialog can handle loading state
    } finally {
      dispatch(setLoadingState({ operation: 'deletingSalaryRule', loading: false }));
    }
  }, [classId, selectedRule, dispatch, fetchSalaryRules, fetchSalaryPreview, selectedYear, selectedMonth, closeDialogs]);

  // Get loading states for CRUD operations
  const createLoading = useAppSelector((state) => state.classes.loading.creatingSalaryRule);
  const updateLoading = useAppSelector((state) => state.classes.loading.updatingSalaryRule);
  const deleteLoading = useAppSelector((state) => state.classes.loading.deletingSalaryRule);

  return {
    salaryRules,
    loading,
    error,
    hasFetched,
    refetch: () => {
      rulesRequestedRef.current = false;
      fetchSalaryRules();
    },
    // Dialog state
    showCreateDialog,
    showEditDialog,
    showDeleteDialog,
    selectedRule,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialogs,
    // CRUD handlers
    handleCreateRule,
    handleUpdateRule,
    handleDeleteRule,
    createLoading,
    updateLoading,
    deleteLoading,
    // Preview data
    salaryPreview,
    previewLoading,
    previewError,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    refetchPreview: () => {
      previewRequestedKeyRef.current = null;
      fetchSalaryPreview(selectedYear, selectedMonth);
    },
  };
};
