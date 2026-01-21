import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import {
  Student,
  setStudents,
  addStudent,
  updateStudent as updateInStore,
  deleteStudent as deleteFromStore,
  setSelectedStudent,
  setDiscountTypes,
  setLoadingState,
  setError,
  clearError,
  clearAllErrors,
  setSearchResults,
  setSearchQuery,
  setSearchParams,
  setSearchMode,
  setCurrentPage,
  setPageSize,
  resetStudentsState,
} from '../../studentsSlice';
import {
  studentApiService,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  getAllDiscountTypes,
} from '@/services/studentApiService';
import {
  StudentSearchParams,
  CreateStudentRequest,
  UpdateStudentRequest,
  DiscountTypeDto,
  StudentFormData,
} from '@/types/api/student';
import { showSuccessMessage, StudentErrorHandlers } from '@/utils/apiErrorHandler';
import { validateAndPrepareStudentData } from '@/domains/students/schemas/studentValidators';

/**
 * Primary hook for student domain operations.
 * Provides Redux state access and API operations.
 *
 * Pattern follows useClasses.ts from the Classes domain.
 */
export const useStudents = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s: RootState) => s.students);

  // === API Operations ===

  const loadStudents = useCallback(async () => {
    dispatch(setLoadingState({ operation: 'fetching', loading: true }));
    dispatch(clearError('fetch'));
    try {
      const data = await getAllStudents();
      dispatch(setStudents(data));
      return data;
    } catch (error) {
      const msg = StudentErrorHandlers.fetchAll(error);
      dispatch(setError({ operation: 'fetch', error: msg }));
      throw error;
    } finally {
      dispatch(setLoadingState({ operation: 'fetching', loading: false }));
    }
  }, [dispatch]);

  const loadDiscountTypes = useCallback(async () => {
    dispatch(setLoadingState({ operation: 'fetchingDiscountTypes', loading: true }));
    dispatch(clearError('fetchDiscountTypes'));
    try {
      const data = await getAllDiscountTypes();
      dispatch(setDiscountTypes(data));
      return data;
    } catch (error) {
      const msg = StudentErrorHandlers.fetchDiscountTypes(error);
      dispatch(setError({ operation: 'fetchDiscountTypes', error: msg }));
      throw error;
    } finally {
      dispatch(setLoadingState({ operation: 'fetchingDiscountTypes', loading: false }));
    }
  }, [dispatch]);

  const search = useCallback(async (params: StudentSearchParams) => {
    dispatch(clearError('search'));
    dispatch(setSearchParams(params));
    try {
      const results = await searchStudents(params);
      dispatch(setSearchResults({
        students: results.students,
        totalCount: results.totalCount,
        currentPage: Math.floor((params.skip || 0) / (params.take || 50)) + 1,
      }));
      dispatch(setSearchMode(true));
      return results;
    } catch (error) {
      const msg = StudentErrorHandlers.search(error);
      dispatch(setError({ operation: 'search', error: msg }));
      throw error;
    }
  }, [dispatch]);

  const create = useCallback(async (data: StudentFormData) => {
    dispatch(setLoadingState({ operation: 'creating', loading: true }));
    dispatch(clearError('create'));
    try {
      const validation = validateAndPrepareStudentData(data, false);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
      }
      const req = validation.data as CreateStudentRequest;
      const createdResponse = await createStudent(req);
      const full = await studentApiService.getStudentById(createdResponse.id);
      dispatch(addStudent(full));
      showSuccessMessage('Student Created', `${full.fullName} has been added.`);
      return full;
    } catch (error) {
      const msg = StudentErrorHandlers.create(error);
      dispatch(setError({ operation: 'create', error: msg }));
      throw error;
    } finally {
      dispatch(setLoadingState({ operation: 'creating', loading: false }));
    }
  }, [dispatch]);

  const update = useCallback(async (id: string, data: StudentFormData) => {
    dispatch(setLoadingState({ operation: 'updating', loading: true }));
    dispatch(clearError('update'));
    try {
      const validation = validateAndPrepareStudentData(data, true);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
      }
      const req = validation.data as UpdateStudentRequest;
      const updated = await updateStudent(id, req);
      dispatch(updateInStore(updated));
      showSuccessMessage('Student Updated', `${updated.fullName} has been updated.`);
      return updated;
    } catch (error) {
      const msg = StudentErrorHandlers.update(error);
      dispatch(setError({ operation: 'update', error: msg }));
      throw error;
    } finally {
      dispatch(setLoadingState({ operation: 'updating', loading: false }));
    }
  }, [dispatch]);

  const remove = useCallback(async (id: string, name: string) => {
    dispatch(setLoadingState({ operation: 'deleting', loading: true }));
    dispatch(clearError('delete'));
    try {
      await deleteStudent(id);
      dispatch(deleteFromStore(id));
      showSuccessMessage('Student Deleted', `${name} has been removed.`);
    } catch (error) {
      const msg = StudentErrorHandlers.delete(error);
      dispatch(setError({ operation: 'delete', error: msg }));
      throw error;
    } finally {
      dispatch(setLoadingState({ operation: 'deleting', loading: false }));
    }
  }, [dispatch]);

  return {
    // === State (dual-state aware) ===
    students: state.isSearchMode ? state.searchResults : state.students,
    all: state.students,
    searchResults: state.searchResults,
    selectedStudent: state.selectedStudent,
    discountTypes: state.discountTypes,

    // === Loading & Errors ===
    loading: state.loading,
    errors: state.errors,

    // === Search State ===
    isSearchMode: state.isSearchMode,
    searchQuery: state.searchQuery,
    searchParams: state.searchParams,

    // === Pagination ===
    totalCount: state.totalCount,
    currentPage: state.currentPage,
    pageSize: state.pageSize,

    // === CRUD Operations ===
    loadStudents,
    loadDiscountTypes,
    search,
    create,
    update,
    remove,

    // === State Setters ===
    setSearchQuery: useCallback((q: string) => dispatch(setSearchQuery(q)), [dispatch]),
    setSearchMode: useCallback((m: boolean) => dispatch(setSearchMode(m)), [dispatch]),
    setSelectedStudent: useCallback((s: Student | null) => dispatch(setSelectedStudent(s)), [dispatch]),
    setCurrentPage: useCallback((p: number) => dispatch(setCurrentPage(p)), [dispatch]),
    setPageSize: useCallback((s: number) => dispatch(setPageSize(s)), [dispatch]),
    clearAllErrors: useCallback(() => dispatch(clearAllErrors()), [dispatch]),
    resetState: useCallback(() => dispatch(resetStudentsState()), [dispatch]),

    // === Legacy Redux actions (for backwards compatibility) ===
    setStudents: useCallback((data: Student[]) => dispatch(setStudents(data)), [dispatch]),
    addStudent: useCallback((data: Student) => dispatch(addStudent(data)), [dispatch]),
    updateStudentInStore: useCallback((data: Student) => dispatch(updateInStore(data)), [dispatch]),
    deleteStudentFromStore: useCallback((id: string) => dispatch(deleteFromStore(id)), [dispatch]),
    setDiscountTypes: useCallback((data: DiscountTypeDto[]) => dispatch(setDiscountTypes(data)), [dispatch]),
    setLoadingState: useCallback(
      (operation: keyof typeof state.loading, loading: boolean) =>
        dispatch(setLoadingState({ operation, loading })),
      [dispatch]
    ),
    setError: useCallback(
      (operation: keyof typeof state.errors, error: string | null) =>
        dispatch(setError({ operation, error })),
      [dispatch]
    ),
    clearError: useCallback(
      (operation: keyof typeof state.errors) => dispatch(clearError(operation)),
      [dispatch]
    ),
    setSearchResults: useCallback(
      (data: { students: Student[]; totalCount: number; currentPage: number }) =>
        dispatch(setSearchResults(data)),
      [dispatch]
    ),
    setSearchParams: useCallback(
      (params: StudentSearchParams) => dispatch(setSearchParams(params)),
      [dispatch]
    ),
  };
};

// Re-export types for convenience
export type { StudentFormData } from '@/types/api/student';
