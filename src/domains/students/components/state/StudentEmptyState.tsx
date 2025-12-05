import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';

interface StudentEmptyStateProps {
  hasActiveFilters?: boolean;
  onAddStudent: () => void;
}

const StudentEmptyState: React.FC<StudentEmptyStateProps> = ({
  hasActiveFilters = false,
  onAddStudent,
}) => {
  return (
    <GlassCard className="p-12 text-center" animate={false}>
      <div className="text-white/60 mb-4">
        {hasActiveFilters
          ? 'No students found matching your filters.'
          : 'No students available.'}
      </div>
      <Button
        onClick={onAddStudent}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add First Student
      </Button>
    </GlassCard>
  );
};

export default StudentEmptyState;

