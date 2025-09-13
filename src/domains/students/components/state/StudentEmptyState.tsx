import React from 'react';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';

interface StudentEmptyStateProps {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive';
  hasActiveFilters?: boolean;
  isLoading?: boolean;
  onAddStudent: () => void;
}

const StudentEmptyState: React.FC<StudentEmptyStateProps> = ({
  searchTerm,
  statusFilter,
  hasActiveFilters = false,
  isLoading = false,
  onAddStudent,
}) => {
  // Use prop if provided, otherwise calculate from basic filters
  const hasFilters = hasActiveFilters || searchTerm || statusFilter !== 'all';

  return (
    <GlassCard className="p-12 text-center">
      <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        No Students Found
      </h3>
      <p className="text-white/60 mb-6">
        {isLoading
          ? 'Searching for students...'
          : hasFilters
          ? 'No students match your current search criteria. Try adjusting your filters or search terms.'
          : 'Start by adding your first student to the system.'}
      </p>
      {!hasFilters && !isLoading && (
        <Button
          onClick={onAddStudent}
          className="bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add First Student
        </Button>
      )}
    </GlassCard>
  );
};

export default StudentEmptyState;

