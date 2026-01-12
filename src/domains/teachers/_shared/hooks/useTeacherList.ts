import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTeachers } from './useTeachers';
import { Teacher } from '../../teachersSlice';
import {
  getAllTeachers,
  searchTeachers,
  getAllSubjects,
} from '@/services/teacherApiService';
import { TeacherErrorHandlers } from '@/utils/apiErrorHandler';
import { TeacherSearchParams, SubjectDto } from '@/types/api/teacher';

export interface UseTeacherListOptions {
  initialPageSize?: number;
}

export interface UseTeacherListReturn {
  // Data from Redux
  teachers: Teacher[];
  displayTeachers: Teacher[];
  subjects: SubjectDto[];
  searchResults: Teacher[];
  isSearchMode: boolean;
  searchParams: TeacherSearchParams;

  // Pagination state
  currentPage: number;
  pageSize: number;

  // Initialization
  isInitialized: boolean;

  // Actions
  loadTeachers: (params?: TeacherSearchParams) => Promise<void>;
  loadSubjects: () => Promise<void>;
  searchTeachersApi: (params: TeacherSearchParams) => Promise<void>;
  setCurrentPage: (page: number) => void;

  // Redux actions (pass-through for composition)
  setTeachers: (data: Teacher[]) => void;
  setSubjects: (data: SubjectDto[]) => void;
  setSearchMode: (isSearchMode: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Teacher[]) => void;
  setSearchParams: (params: TeacherSearchParams) => void;
  clearError: (operation: string) => void;
  setError: (operation: string, error: string | null) => void;
}

export const useTeacherList = (options?: UseTeacherListOptions): UseTeacherListReturn => {
  const {
    teachers,
    displayTeachers,
    subjects,
    searchResults,
    isSearchMode,
    searchParams,
    setTeachers,
    setSubjects,
    setSearchResults,
    setSearchQuery,
    setSearchParams,
    setSearchMode,
    clearError,
    setError,
  } = useTeachers();

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(options?.initialPageSize ?? 10);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load all teachers with optional filters
  const loadTeachers = useCallback(async (params?: TeacherSearchParams) => {
    clearError('fetch');

    try {
      const teachersData = await getAllTeachers(params);
      setTeachers(teachersData);

      // If we have filters, set search mode
      if (params && (params.searchTerm || params.subjectId)) {
        setSearchMode(true);
      } else {
        setSearchMode(false);
      }
    } catch (error) {
      const errorMessage = TeacherErrorHandlers.fetchAll(error);
      setError('fetch', errorMessage);
    }
  }, [clearError, setTeachers, setSearchMode, setError]);

  // Load all subjects
  const loadSubjects = useCallback(async () => {
    clearError('fetchSubjects');

    try {
      const subjectsData = await getAllSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      const errorMessage = TeacherErrorHandlers.fetchSubjects(error);
      setError('fetchSubjects', errorMessage);
    }
  }, [clearError, setSubjects, setError]);

  // Search teachers with API
  const searchTeachersApi = useCallback(async (params: TeacherSearchParams) => {
    clearError('search');
    setSearchParams(params);

    try {
      const results = await searchTeachers(
        params.searchTerm,
        params.subjectId
      );
      setSearchResults(results);
      setSearchMode(true);
    } catch (error) {
      const errorMessage = TeacherErrorHandlers.search(error);
      setError('search', errorMessage);
    }
  }, [clearError, setSearchParams, setSearchResults, setSearchMode, setError]);

  // Initialize on mount
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await Promise.all([loadTeachers(), loadSubjects()]);
        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize teachers:', error);
        if (mounted) {
          setIsInitialized(true); // Still mark as initialized to show error state
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // Data
    teachers,
    displayTeachers,
    subjects,
    searchResults,
    isSearchMode,
    searchParams,

    // Pagination
    currentPage,
    pageSize,

    // Initialization
    isInitialized,

    // Actions
    loadTeachers,
    loadSubjects,
    searchTeachersApi,
    setCurrentPage,

    // Redux actions (pass-through)
    setTeachers,
    setSubjects,
    setSearchMode,
    setSearchQuery,
    setSearchResults,
    setSearchParams,
    clearError,
    setError,
  };
};
