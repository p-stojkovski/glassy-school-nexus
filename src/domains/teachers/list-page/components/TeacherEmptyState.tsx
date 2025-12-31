import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';

interface TeacherEmptyStateProps {
  hasActiveFilters?: boolean;
  onAddTeacher: () => void;
}

const TeacherEmptyState: React.FC<TeacherEmptyStateProps> = ({
  hasActiveFilters = false,
  onAddTeacher,
}) => {
  return (
    <GlassCard className="p-12 text-center" animate={false}>
      <div className="text-white/60 mb-4">
        {hasActiveFilters
          ? 'No teachers found matching your filters.'
          : 'No teachers available.'}
      </div>
      <Button
        onClick={onAddTeacher}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add First Teacher
      </Button>
    </GlassCard>
  );
};

export default TeacherEmptyState;
