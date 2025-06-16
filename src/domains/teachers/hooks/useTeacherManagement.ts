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
      const matchesSubject =
        subjectFilter === 'all' || teacher.subject === subjectFilter;

      return matchesSearch && matchesSubject;
    });
  }, [teachers, searchTerm, subjectFilter]);
  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSubjectFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || subjectFilter !== 'all';

  return {
    // Filter state
    searchTerm,
    setSearchTerm,
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
