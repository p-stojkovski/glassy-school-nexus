import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';

interface PrivateLessonEmptyStateProps {
  onAddLesson: () => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

const PrivateLessonEmptyState: React.FC<PrivateLessonEmptyStateProps> = ({
  onAddLesson,
  hasFilters = false,
  onClearFilters,
}) => {
  if (hasFilters) {
    return (
      <GlassCard className="p-12 text-center">
        <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No lessons found
        </h3>
        <p className="text-white/60 mb-6">
          No private lessons match your current search criteria. Try adjusting
          your filters or search terms.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onClearFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20"
            >
              Clear Filters
            </Button>
          )}
          <Button
            onClick={onAddLesson}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule New Lesson
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-12 text-center">
      <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        No private lessons scheduled
      </h3>
      <p className="text-white/60 mb-6">
        Get started by scheduling your first private lesson. Provide
        personalized education with one-on-one sessions.
      </p>
      <Button
        onClick={onAddLesson}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
      >
        <Plus className="w-4 h-4 mr-2" />
        Schedule First Lesson
      </Button>
    </GlassCard>
  );
};

export default PrivateLessonEmptyState;

