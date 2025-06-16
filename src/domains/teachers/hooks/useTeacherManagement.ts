import { useState, useMemo } from 'react';
import { Teacher } from '@/domains/teachers/teachersSlice';

export type TeacherViewMode = 'grid' | 'table';

interface UseTeacherManagementProps {
  teachers: Teacher[];
}

export const useTeacherManagement = ({
  teachers,
}: UseTeacherManagementProps) => {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // View state
  const [viewMode, setViewMode] = useState<TeacherViewMode>('grid');

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || teacher.status === statusFilter;

      const matchesSubject =
        subjectFilter === 'all' || teacher.subject === subjectFilter;

      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [teachers, searchTerm, statusFilter, subjectFilter]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSubjectFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm !== '' || statusFilter !== 'all' || subjectFilter !== 'all';

  return {
    // Filter state
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    subjectFilter,
    setSubjectFilter,
    clearFilters,
    hasActiveFilters,

    // View state
    viewMode,
    setViewMode,

    // Computed data
    filteredTeachers,
  };
};
