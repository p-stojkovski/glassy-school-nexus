import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import ClassTable from '@/domains/classesApi/components/ClassTable';
import ClassGrid from '@/domains/classesApi/components/ClassGrid';
import ClassFilters, { ClassViewMode } from '@/domains/classes/components/filters/ClassFilters';
import ClassLoading from '@/domains/classes/components/state/ClassLoading';
import { useClassesApi } from '@/domains/classesApi/hooks/useClassesApi';
import { classApiService } from '@/services/classApiService';
import { ClassResponse } from '@/types/api/class';
import { AcademicYear } from '@/domains/settings/types/academicCalendarTypes';

const ClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes, loadClasses, search, setSearchQuery, setSearchMode, isSearchMode } = useClassesApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState<'all' | string>('all');
  const [subjectFilter, setSubjectFilter] = useState<'all' | string>('all');
  const [teacherFilter, setTeacherFilter] = useState<'all' | string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'full'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [viewMode, setViewMode] = useState<ClassViewMode>('table');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasDisabledClasses, setHasDisabledClasses] = useState<boolean>(false);
  const [activeYearId, setActiveYearId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousFiltersRef = useRef({ searchTerm: '', academicYearFilter: 'all', subjectFilter: 'all', teacherFilter: 'all', availabilityFilter: 'all', statusFilter: 'active' as 'all' | 'active' | 'inactive' });


  // Handler for when academic years are loaded - set default to active year
  const handleYearsLoaded = useCallback((years: AcademicYear[]) => {
    const active = years.find((y) => y.isActive);
    if (active) {
      setActiveYearId(active.id);
      // Set default to active year if user hasn't chosen one yet
      if (academicYearFilter === 'all') {
        setAcademicYearFilter(active.id);
      }
    }
  }, [academicYearFilter]);

  // Load classes only once on mount with disabled global loading
  useEffect(() => {
    let mounted = true;
    
    const initializeClasses = async () => {
      try {
        // Load active classes for display
        await loadClasses();
        
        // Also fetch count of disabled classes
        const allClasses = await classApiService.searchClasses({ includeDisabled: true, includeAllYears: true });
        const hasDisabled = allClasses.some((c: ClassResponse) => !c.isActive);
        if (mounted) {
          setHasDisabledClasses(hasDisabled);
          setIsInitialized(true);
        }
      } finally {
      }
    };

    initializeClasses();

    return () => {
      mounted = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []); // Empty dependency - run only once

  // Year filter is active when any specific year is selected
  const hasYearFilter = academicYearFilter !== 'all';

  const hasStatusFilter = statusFilter !== 'all';

  const hasActiveFilters = searchTerm.trim() !== '' ||
    hasYearFilter ||
    subjectFilter !== 'all' ||
    teacherFilter !== 'all' ||
    availabilityFilter !== 'all' ||
    hasStatusFilter;

  const handleSearch = useCallback(async () => {
    // Only search if there are active filters
    if (hasActiveFilters) {
      await search({
        searchTerm: searchTerm.trim() || undefined,
        academicYearId: academicYearFilter !== 'all' ? academicYearFilter : undefined,
        includeAllYears: academicYearFilter === 'all',
        subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
        teacherId: teacherFilter !== 'all' ? teacherFilter : undefined,
        onlyWithAvailableSlots: availabilityFilter === 'available' || undefined,
        includeDisabled: statusFilter !== 'active'
      });
    } else {
      // Exit search mode when no filters are active
      setSearchMode(false);
    }
  }, [hasActiveFilters, searchTerm, academicYearFilter, subjectFilter, teacherFilter, availabilityFilter, statusFilter, search, setSearchMode]);

  const clearFilters = () => {
    setSearchTerm('');
    // Reset to active year (or 'all' if no active year)
    setAcademicYearFilter(activeYearId || 'all');
    setSubjectFilter('all');
    setTeacherFilter('all');
    setAvailabilityFilter('all');
    setStatusFilter('active');
    setSearchQuery('');
    // Exit search mode and reload all classes
    setSearchMode(false);
    loadClasses();
  };

  const handleFilterChange = useCallback((type: string, value: string) => {
    if (type === 'academicYear') {
      setAcademicYearFilter(value as 'all' | string);
    } else if (type === 'subject') {
      setSubjectFilter(value as 'all' | string);
    } else if (type === 'teacher') {
      setTeacherFilter(value as 'all' | string);
    } else if (type === 'availableSlots') {
      setAvailabilityFilter(value === 'available' ? 'available' : 'all');
    } else if (type === 'status') {
      setStatusFilter(value as 'all' | 'active' | 'inactive');
    }
  }, []);

  // Handle filter changes with debouncing - but only after initialization
  useEffect(() => {
    // Skip if not initialized yet to prevent duplicate initial load
    if (!isInitialized) return;
    
    // Check if filters actually changed
    const currentFilters = { searchTerm, academicYearFilter, subjectFilter, teacherFilter, availabilityFilter, statusFilter };
    const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(previousFiltersRef.current);
    
    if (!filtersChanged) return;
    
    previousFiltersRef.current = currentFilters;
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for search or exit search mode
    searchTimeoutRef.current = setTimeout(async () => {
      if (hasActiveFilters) {
        setIsSearching(true);
        const startTime = Date.now();
        
        try {
          await search({
            searchTerm: searchTerm.trim() || undefined,
            academicYearId: academicYearFilter !== 'all' ? academicYearFilter : undefined,
            includeAllYears: academicYearFilter === 'all',
            subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
            teacherId: teacherFilter !== 'all' ? teacherFilter : undefined,
            onlyWithAvailableSlots: availabilityFilter === 'available' || undefined,
            includeDisabled: statusFilter !== 'active'
          });
          
          // Ensure minimum loading duration for better UX
          const elapsed = Date.now() - startTime;
          const minDuration = 500; // 500ms minimum
          if (elapsed < minDuration) {
            await new Promise(resolve => setTimeout(resolve, minDuration - elapsed));
          }
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchMode(false);
        setIsSearching(false); // Ensure loading state is cleared
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, academicYearFilter, subjectFilter, teacherFilter, availabilityFilter, statusFilter, isInitialized, hasActiveFilters, search, setSearchMode]);

  // Immediately exit search mode when no filters are active
  useEffect(() => {
    if (isInitialized && !hasActiveFilters && isSearchMode) {
      setSearchMode(false);
    }
  }, [isInitialized, hasActiveFilters, isSearchMode, setSearchMode]);

  // Show page-specific loading spinner during initialization
  if (!isInitialized) {
    return <ClassLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Class Management</h3>
          <p className=" text-md text-white/70">Manage classes, schedules, and enrollment</p>
        </div>
        <Button
          onClick={() => navigate('/classes/new')}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Class
        </Button>
      </div>

      <ClassFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        academicYearFilter={academicYearFilter}
        subjectFilter={subjectFilter}
        teacherFilter={teacherFilter}
        statusFilter={statusFilter}
        showOnlyWithAvailableSlots={availabilityFilter === 'available'}
        onFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isSearching={isSearching}
        hasActiveFilters={hasActiveFilters}
        onYearsLoaded={handleYearsLoaded}
        activeYearId={activeYearId}
      />

      {classes.length === 0 ? (
        <GlassCard className="p-12 text-center" animate={false}>
          <div className="text-white/60 mb-4">
            {hasActiveFilters ? 'No classes found matching your filters.' : 'No classes available.'}
          </div>
          <Button
            onClick={() => navigate('/classes/new')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Class
          </Button>
        </GlassCard>
      ) : (
        viewMode === 'grid' ? (
          <ClassGrid
            classes={classes}
            onView={(c) => navigate(`/classes/${c.id}`)}
          />
        ) : (
          <ClassTable
            classes={classes}
            onView={(c) => navigate(`/classes/${c.id}`)}
          />
        )
      )}
    </div>
  );
};

export default ClassesPage;

