
import React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import GlassCard from '../../common/GlassCard';

interface ClassEmptyStateProps {
  hasFilters: boolean;
  onCreateClass: () => void;
}

const ClassEmptyState: React.FC<ClassEmptyStateProps> = ({ hasFilters, onCreateClass }) => {
  return (
    <GlassCard className="p-12 text-center">
      <BookOpen className="w-16 h-16 text-white/40 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">No Classes Found</h3>
      <p className="text-white/60 mb-6">
        {hasFilters
          ? 'No classes match your current search criteria.' 
          : 'Start by creating your first class.'}
      </p>
      {!hasFilters && (
        <Button 
          onClick={onCreateClass}
          className="bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create First Class
        </Button>
      )}
    </GlassCard>
  );
};

export default ClassEmptyState;
