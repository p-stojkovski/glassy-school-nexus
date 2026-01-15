import { useState, useCallback } from 'react';
import { useTeachers } from './useTeachers';
import { useTeacherList } from './useTeacherList';
import { useTeacherFilters } from './useTeacherFilters';
import { useTeacherCRUD } from './useTeacherCRUD';
import { Teacher } from '../../teachersSlice';
import { TeacherSearchParams } from '@/types/api/teacher';

export type TeacherViewMode = 'grid' | 'table';

export interface TeacherFormData {
  name: string;
  email: string;
  phone?: string;
  subjectId: string;
  notes?: string;
}

export const useTeacherManagement = () => {
  // Get additional Redux state not provided by sub-hooks
  const {
    loading: reduxLoading,
    errors: reduxErrors,
    setSelectedTeacher: setStoreSelectedTeacher,
  } = useTeachers();

  // Compose sub-hooks
  const teacherList = useTeacherList({ initialPageSize: 10 });

  const teacherFilters = useTeacherFilters({
    displayTeachers: teacherList.displayTeachers,
    searchResults: teacherList.searchResults,
    isSearchMode: teacherList.isSearchMode,
    pageSize: teacherList.pageSize,
    currentPage: teacherList.currentPage,
    setCurrentPage: teacherList.setCurrentPage,
    loadTeachers: teacherList.loadTeachers,
    setSearchQuery: teacherList.setSearchQuery,
    setSearchMode: teacherList.setSearchMode,
  });

  const teacherCRUD = useTeacherCRUD();

  // Local UI state (stays in this hook)
  const [viewMode, setViewMode] = useState<TeacherViewMode>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // UI Handlers
  const handleAddTeacher = useCallback(() => {
    setSelectedTeacher(null);
    setIsFormOpen(true);
  }, []);

  const handleEditTeacher = useCallback((teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsFormOpen(true);
  }, []);

  const handleDeleteTeacher = useCallback((teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setIsConfirmOpen(true);
  }, []);

  const handleViewTeacher = useCallback((teacher: Teacher) => {
    setStoreSelectedTeacher(teacher);
  }, [setStoreSelectedTeacher]);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedTeacher(null);
  }, []);

  const handleSubmit = useCallback(async (data: TeacherFormData) => {
    if (selectedTeacher) {
      await teacherCRUD.updateTeacherApi(selectedTeacher.id, data);
    } else {
      await teacherCRUD.createTeacherApi(data);
    }
    handleCloseForm();
  }, [selectedTeacher, teacherCRUD, handleCloseForm]);

  const confirmDeleteTeacher = useCallback(async () => {
    if (teacherToDelete) {
      try {
        await teacherCRUD.deleteTeacherApi(teacherToDelete.id, teacherToDelete.name);
        setTeacherToDelete(null);
        setIsConfirmOpen(false);
      } catch {
        // Error already handled by API function
      }
    }
  }, [teacherToDelete, teacherCRUD]);

  const handleAdvancedSearch = useCallback((params: TeacherSearchParams) => {
    teacherList.searchTeachersApi(params);
  }, [teacherList]);

  const handlePageChange = useCallback((page: number) => {
    teacherList.setCurrentPage(page);
  }, [teacherList]);

  // Return the EXACT same interface as before
  return {
    // Data
    teachers: teacherFilters.paginatedTeachers,
    allTeachers: teacherList.displayTeachers,
    subjects: teacherList.subjects,
    filteredTeachers: teacherFilters.filteredTeachers,
    searchResults: teacherList.searchResults,
    isSearchMode: teacherList.isSearchMode,
    totalCount: teacherFilters.totalCount,
    currentPage: teacherList.currentPage,
    pageSize: teacherList.pageSize,

    // Loading states (only form-related, global loading handled by interceptor)
    loading: reduxLoading,
    isLoading: teacherCRUD.loading.creating || teacherCRUD.loading.updating || teacherCRUD.loading.deleting,
    isInitialized: teacherList.isInitialized,

    // Error states
    errors: reduxErrors,

    // Filter state
    searchTerm: teacherFilters.searchTerm,
    statusFilter: teacherFilters.statusFilter,
    subjectFilter: teacherFilters.subjectFilter,
    hasActiveFilters: teacherFilters.hasActiveFilters,
    searchParams: teacherList.searchParams,

    // View state
    viewMode,
    setViewMode,

    // UI state
    isFormOpen,
    isConfirmOpen,
    selectedTeacher,
    teacherToDelete,

    // API functions
    loadTeachers: teacherList.loadTeachers,
    loadSubjects: teacherList.loadSubjects,
    createTeacher: teacherCRUD.createTeacherApi,
    updateTeacher: teacherCRUD.updateTeacherApi,
    deleteTeacher: teacherCRUD.deleteTeacherApi,
    searchTeachers: teacherList.searchTeachersApi,

    // UI handlers
    handleAddTeacher,
    handleEditTeacher,
    handleDeleteTeacher,
    handleViewTeacher,
    handleCloseForm,
    handleSubmit,
    confirmDeleteTeacher,
    clearFilters: teacherFilters.clearFilters,
    handleSearchChange: teacherFilters.handleSearchChange,
    handleAdvancedSearch,
    handlePageChange,

    // Filter handlers
    setSearchTerm: teacherFilters.setSearchTerm,
    setStatusFilter: teacherFilters.setStatusFilter,
    setSubjectFilter: teacherFilters.setSubjectFilter,

    // State setters
    setIsFormOpen,
    setIsConfirmOpen,
  };
};
