import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Plus, Users, Grid3x3, Table2 } from 'lucide-react';
import { RootState } from '../store';
import { setTeachers, setLoading } from '@/domains/teachers/teachersSlice';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import GlassCard from '@/components/common/GlassCard';
import DemoNotice from '@/components/common/DemoNotice';
import TeacherCard from '@/domains/teachers/components/TeacherCard';
import TeacherForm from '@/domains/teachers/components/TeacherForm';
import TeacherFilters from '@/domains/teachers/components/filters/TeacherFilters';
import TeacherTable from '@/domains/teachers/components/list/TeacherTable';
import { Teacher } from '@/domains/teachers/teachersSlice';
import { useTeachersData } from '@/data/hooks/useTeachersData';
import { useTeacherManagement } from '@/domains/teachers/hooks/useTeacherManagement';

const Teachers: React.FC = () => {
  const dispatch = useAppDispatch();
  const { teachers, loading } = useAppSelector(
    (state: RootState) => state.teachers
  );

  // Load teachers data when needed
  const teachersHook = useTeachersData({
    autoLoad: true,
    loadOnMount: true,
    showErrorToasts: true,
  });
  // Teacher management hook
  const {
    searchTerm,
    setSearchTerm,
    subjectFilter,
    setSubjectFilter,
    clearFilters,
    viewMode,
    setViewMode,
    filteredTeachers,
  } = useTeacherManagement({ teachers });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setIsFormOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTeacher(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Notice */}
      <DemoNotice message="You are viewing demo teacher data. All changes are temporary and will be lost on page refresh." />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Teacher Management
          </h1>
          <p className="text-white/70">
            Manage teacher profiles and information
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleAddTeacher}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>{' '}
      {/* Enhanced Filters */}
      <TeacherFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        clearFilters={clearFilters}
      />
      {/* Teachers Display */}
      {filteredTeachers.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Teachers Found
          </h3>{' '}
          <p className="text-white/60 mb-6">
            {searchTerm || subjectFilter !== 'all'
              ? 'No teachers match your current search criteria.'
              : 'Start by adding your first teacher to the system.'}
          </p>
          {!searchTerm && subjectFilter === 'all' && (
            <Button
              onClick={handleAddTeacher}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Teacher
            </Button>
          )}
        </GlassCard>
      ) : viewMode === 'table' ? (
        <TeacherTable teachers={filteredTeachers} onEdit={handleEditTeacher} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onEdit={() => handleEditTeacher(teacher)}
            />
          ))}
        </div>
      )}
      {/* Teacher Form Modal */}
      {isFormOpen && (
        <TeacherForm
          teacher={selectedTeacher}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Teachers;
