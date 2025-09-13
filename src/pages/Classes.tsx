import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ClassTable from '@/domains/classesApi/components/ClassTable';
import ClassGrid from '@/domains/classesApi/components/ClassGrid';
import ClassFilters, { ClassViewMode } from '@/domains/classes/components/filters/ClassFilters';
import ClassLoading from '@/domains/classes/components/state/ClassLoading';
import { useClassesApi } from '@/domains/classesApi/hooks/useClassesApi';
import { classApiService } from '@/services/classApiService';
import { ClassResponse } from '@/types/api/class';

const ClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes, loadClasses, search, setSearchQuery, setSearchMode, isSearchMode, remove } = useClassesApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<'all' | string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'full'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<ClassViewMode>('table');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState<ClassResponse | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousFiltersRef = useRef({ searchTerm: '', subjectFilter: 'all', availabilityFilter: 'all' });


  // Load classes only once on mount with disabled global loading
  useEffect(() => {
    let mounted = true;
    
    const initializeClasses = async () => {
      try {
        
        classApiService
        
        await loadClasses();
        
        if (mounted) {
          setIsInitialized(true);
        }
      } finally {
        
        if (mounted) {
          classApiService
        }
      }
    };

    initializeClasses();

    return () => {
      mounted = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      // Ensure global loading is re-enabled on cleanup
      classApiService
    };
  }, []); // Empty dependency - run only once

  const hasActiveFilters = searchTerm.trim() !== '' || 
    subjectFilter !== 'all' || 
    availabilityFilter !== 'all' || 
    statusFilter !== 'all';

  const handleSearch = useCallback(async () => {
    // Only search if there are active filters
    if (hasActiveFilters) {
      await search({
        searchTerm: searchTerm.trim() || undefined,
        subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
        onlyWithAvailableSlots: availabilityFilter === 'available' || undefined
      });
    } else {
      // Exit search mode when no filters are active
      setSearchMode(false);
    }
  }, [hasActiveFilters, searchTerm, subjectFilter, availabilityFilter, search, setSearchMode]);

  const clearFilters = () => {
    setSearchTerm('');
    setSubjectFilter('all');
    setAvailabilityFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
    // Exit search mode and reload all classes
    setSearchMode(false);
    loadClasses();
  };

  const handleFilterChange = useCallback((type: string, value: string) => {
    if (type === 'subject') {
      setSubjectFilter(value as 'all' | string);
    } else if (type === 'availableSlots') {
      setAvailabilityFilter(value === 'true' ? 'available' : 'all');
    }
  }, []);

  // Handle filter changes with debouncing - but only after initialization
  useEffect(() => {
    // Skip if not initialized yet to prevent duplicate initial load
    if (!isInitialized) return;
    
    // Check if filters actually changed
    const currentFilters = { searchTerm, subjectFilter, availabilityFilter };
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
            subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
            onlyWithAvailableSlots: availabilityFilter === 'available' || undefined
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
  }, [searchTerm, subjectFilter, availabilityFilter, isInitialized, hasActiveFilters, search, setSearchMode]);

  // Immediately exit search mode when no filters are active
  useEffect(() => {
    if (isInitialized && !hasActiveFilters && isSearchMode) {
      setSearchMode(false);
    }
  }, [isInitialized, hasActiveFilters, isSearchMode, setSearchMode]);

  // Delete handler functions
  const handleDelete = (classItem: ClassResponse) => {
    setClassToDelete(classItem);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (classToDelete) {
      try {
        await remove(classToDelete.id, classToDelete.name);
        setShowDeleteDialog(false);
        setClassToDelete(null);
      } catch (error) {
        // Error handling is done in the remove function via toast
        console.error('Failed to delete class:', error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setClassToDelete(null);
  };

  // Show page-specific loading spinner during initialization
  if (!isInitialized) {
    return <ClassLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Class Management</h1>
          <p className="text-white/70">Manage classes, schedules, and enrollment</p>
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
        subjectFilter={subjectFilter}
        showOnlyWithAvailableSlots={availabilityFilter === 'available'}
        onFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isSearching={isSearching}
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
            onEdit={(c) => navigate(`/classes/edit/${c.id}`)}
            onDelete={handleDelete}
            onView={(c) => navigate(`/classes/${c.id}`)}
          />
        ) : (
          <ClassTable
            classes={classes}
            onEdit={(c) => navigate(`/classes/edit/${c.id}`)}
            onDelete={handleDelete}
            onView={(c) => navigate(`/classes/${c.id}`)}
          />
        )
      )}
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Class"
        description={`Are you sure you want to delete "${classToDelete?.name}"? This action cannot be undone and will remove all associated data.`}
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ClassesPage;

