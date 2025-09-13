import React from 'react';
import { Plus, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import ClassroomCard from '../ClassroomCard';
import { Classroom } from '../../classroomsSlice';

interface ClassroomGridProps {
  classrooms: Classroom[];
  searchTerm: string;
  onAddClassroom: () => void;
  onEditClassroom: (classroom: Classroom) => void;
  onDeleteClassroom: (classroom: Classroom) => void;
  onViewClassroom: (classroom: Classroom) => void;
}

const ClassroomGrid: React.FC<ClassroomGridProps> = ({
  classrooms,
  searchTerm,
  onAddClassroom,
  onEditClassroom,
  onDeleteClassroom,
  onViewClassroom,
}) => {
  // Guard against unexpected non-array inputs to keep UI resilient
  const list = Array.isArray(classrooms) ? classrooms : [];

  if (list.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <Building className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No Classrooms Found
        </h3>{' '}
        <p className="text-white/60 mb-6">
          {searchTerm
            ? 'No classrooms match your current search criteria.'
            : 'Start by adding your first classroom to the system.'}
        </p>
        {!searchTerm && (
          <Button
            onClick={onAddClassroom}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Classroom
          </Button>
        )}
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((classroom) => (
        <ClassroomCard
          key={classroom.id}
          classroom={classroom}
          onEdit={() => onEditClassroom(classroom)}
          onDelete={() => onDeleteClassroom(classroom)}
          onView={() => onViewClassroom(classroom)}
        />
      ))}
    </div>
  );
};

export default ClassroomGrid;

