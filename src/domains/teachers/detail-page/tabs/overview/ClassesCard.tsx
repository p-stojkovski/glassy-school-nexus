import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import { ClassesOverview } from '@/types/api/teacher';
import { BookOpen, ChevronRight } from 'lucide-react';

interface ClassesCardProps {
  data: ClassesOverview;
  onClick: () => void;
}

const ClassesCard: React.FC<ClassesCardProps> = ({ data, onClick }) => {
  const hasClasses = data.totalClasses > 0;

  return (
    <GlassCard
      className="p-4 cursor-pointer transition-all hover:bg-white/5"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/60">Classes</h3>
        <BookOpen className="w-4 h-4 text-white/40" />
      </div>

      {hasClasses ? (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">{data.totalClasses}</p>
            <div className="text-right">
              <span className="text-sm text-green-400">{data.activeClasses} active</span>
            </div>
          </div>
          {data.inactiveClasses > 0 && (
            <p className="text-xs text-white/50">
              {data.inactiveClasses} inactive
            </p>
          )}
          {data.mostRecentClassName && (
            <p className="text-xs text-white/50 truncate">
              Latest: {data.mostRecentClassName}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-white/50">No classes assigned yet</p>
      )}

      <div className="mt-3 flex items-center text-xs text-white/40">
        <span>View all classes</span>
        <ChevronRight className="w-3 h-3 ml-1" />
      </div>
    </GlassCard>
  );
};

export default ClassesCard;
