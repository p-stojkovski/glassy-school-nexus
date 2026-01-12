import { useState, useMemo, useCallback, useEffect } from 'react';
import { Teacher } from '../../teachersSlice';
import { TeacherSearchParams } from '@/types/api/teacher';

export interface UseTeacherFiltersOptions {
  displayTeachers: Teacher[];
  searchResults: Teacher[];
  isSearchMode: boolean;
  pageSize: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  loadTeachers: (params?: TeacherSearchParams) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSearchMode: (isSearchMode: boolean) => void;
}

export interface UseTeacherFiltersReturn {
  // Filter state
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive';
  subjectFilter: string;
  experienceFilter: 'all' | '0-2' | '3-5' | '5+';
  hasActiveFilters: boolean;

  // Derived data
  filteredTeachers: Teacher[];
  paginatedTeachers: Teacher[];
  totalCount: number;

  // Filter setters
  setSearchTerm: (term: string) => void;
  setStatusFilter: (value: 'all' | 'active' | 'inactive') => void;
  setSubjectFilter: (value: string) => void;
  setExperienceFilter: (value: 'all' | '0-2' | '3-5' | '5+') => void;

  // Actions
  clearFilters: () => void;
  handleSearchChange: (term: string) => void;
  handleSubjectFilterChange: (subjectId: string) => void;

  // Utilities
  calculateExperience: (joinDate: string) => number;
}

export const useTeacherFilters = (options: UseTeacherFiltersOptions): UseTeacherFiltersReturn => {
  const {
    displayTeachers,
    searchResults,
    isSearchMode,
    pageSize,
    currentPage,
    setCurrentPage,
    loadTeachers,
    setSearchQuery,
    setSearchMode,
  } = options;

  // Local filter state
  const [searchTerm, setSearchTermState] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<'all' | '0-2' | '3-5' | '5+'>('all');

  // Calculate years of experience from joinDate
  const calculateExperience = useCallback((joinDate: string): number => {
    const join = new Date(joinDate);
    const now = new Date();
    const years = now.getFullYear() - join.getFullYear();
    const monthDiff = now.getMonth() - join.getMonth();
    return monthDiff < 0 || (monthDiff === 0 && now.getDate() < join.getDate()) ? years - 1 : years;
  }, []);

  // Apply local filters to teachers
  const filteredTeachers = useMemo(() => {
    if (isSearchMode) {
      return searchResults || [];
    }

    let filtered = displayTeachers;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => statusFilter === 'active' ? t.isActive : !t.isActive);
    }

    // Subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(t => t.subjectId === subjectFilter);
    }

    // Experience filter
    if (experienceFilter !== 'all') {
      filtered = filtered.filter(t => {
        const years = calculateExperience(t.joinDate);
        if (experienceFilter === '0-2') return years >= 0 && years <= 2;
        if (experienceFilter === '3-5') return years >= 3 && years <= 5;
        if (experienceFilter === '5+') return years > 5;
        return true;
      });
    }

    // Search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [displayTeachers, searchResults, isSearchMode, statusFilter, subjectFilter, experienceFilter, searchTerm, calculateExperience]);

  // Pagination
  const totalCount = filteredTeachers.length;
  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTeachers.slice(startIndex, startIndex + pageSize);
  }, [filteredTeachers, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, subjectFilter, experienceFilter, searchTerm, setCurrentPage]);

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || subjectFilter !== 'all' || experienceFilter !== 'all';

  // Wrapper for setSearchTerm to update both local state and Redux
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    setSearchQuery(term);
  }, [setSearchQuery]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTermState('');
    setStatusFilter('all');
    setSubjectFilter('all');
    setExperienceFilter('all');
    setSearchQuery('');
    setSearchMode(false);
    // Reload all teachers without filters
    loadTeachers();
  }, [loadTeachers, setSearchQuery, setSearchMode]);

  // Filter handlers - using loadTeachers with params
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setSearchQuery(term);

    // Call loadTeachers with filters
    const params: TeacherSearchParams = {
      searchTerm: term.trim() || undefined,
      subjectId: subjectFilter !== 'all' ? subjectFilter : undefined
    };

    // If no filters active, load all teachers
    if (!params.searchTerm && !params.subjectId) {
      loadTeachers();
    } else {
      loadTeachers(params);
    }
  }, [subjectFilter, loadTeachers, setSearchTerm, setSearchQuery]);

  const handleSubjectFilterChange = useCallback((subjectId: string) => {
    setSubjectFilter(subjectId);

    // Call loadTeachers with filters
    const params: TeacherSearchParams = {
      searchTerm: searchTerm.trim() || undefined,
      subjectId: subjectId !== 'all' ? subjectId : undefined
    };

    // If no filters active, load all teachers
    if (!params.searchTerm && !params.subjectId) {
      loadTeachers();
    } else {
      loadTeachers(params);
    }
  }, [searchTerm, loadTeachers]);

  return {
    // Filter state
    searchTerm,
    statusFilter,
    subjectFilter,
    experienceFilter,
    hasActiveFilters,

    // Derived data
    filteredTeachers,
    paginatedTeachers,
    totalCount,

    // Filter setters
    setSearchTerm,
    setStatusFilter,
    setSubjectFilter,
    setExperienceFilter,

    // Actions
    clearFilters,
    handleSearchChange,
    handleSubjectFilterChange,

    // Utilities
    calculateExperience,
  };
};
