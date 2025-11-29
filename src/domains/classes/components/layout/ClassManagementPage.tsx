import React from 'react';
import ClassHeader from './ClassHeader';
import ClassFilters from '../filters/ClassFilters';
import ClassCard from '../list/ClassCard';
import ClassTable from '../list/ClassTable';
import ClassEmptyState from '../state/ClassEmptyState';
import ClassLoading from '../state/ClassLoading';
import { DemoManager } from '@/data/components/DemoManager';
import { useClassManagementPage } from '../../hooks/useClassManagementPage';

const ClassManagementPage: React.FC = () => {
  const {
    // Data
    filteredClasses,
    loading,
    hasFilters, // Filter state
    searchTerm,
    setSearchTerm,
    subjectFilter,
    showOnlyWithAvailableSlots,
    clearFilters,
    viewMode,
    setViewMode,

    // Handlers
    handleAddClass,
    handleView,
    handleFilterChange,
  } = useClassManagementPage();


  if (loading) {
    return <ClassLoading />;
  }
  return (
    <div className="space-y-6">
      <DemoManager
        showFullControls={true}
        title="Class Management Demo"
        description="Manage classes, schedules, and enrollment. All data is stored locally and persists between sessions."
      />
      <ClassHeader onAddClass={handleAddClass} />{' '}
      <ClassFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        subjectFilter={subjectFilter}
        showOnlyWithAvailableSlots={showOnlyWithAvailableSlots}
        onFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {filteredClasses.length === 0 ? (
        <ClassEmptyState
          onCreateClass={handleAddClass}
          hasFilters={hasFilters}
        />
      ) : viewMode === 'table' ? (
        <ClassTable
          classes={filteredClasses}
          onView={handleView}
          loading={loading}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onView={handleView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassManagementPage;

