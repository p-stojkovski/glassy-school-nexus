import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import { StudentsOverview } from '@/types/api/teacher';
import { Users, ChevronRight } from 'lucide-react';

interface StudentsCardProps {
  data: StudentsOverview;
  onClick: () => void;
}

const StudentsCard: React.FC<StudentsCardProps> = ({ data, onClick }) => {
  const hasStudents = data.totalStudents > 0;

  return (
    <GlassCard
      className="p-4 cursor-pointer transition-all hover:bg-white/5"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/60">Students</h3>
        <Users className="w-4 h-4 text-white/40" />
      </div>

      {hasStudents ? (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">{data.totalStudents}</p>
            <div className="text-right">
              <span className="text-sm text-green-400">{data.activeStudents} enrolled</span>
            </div>
          </div>
          {data.inactiveStudents > 0 && (
            <p className="text-xs text-white/50">
              {data.inactiveStudents} inactive/transferred
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-white/50">No students in assigned classes</p>
      )}

      <div className="mt-3 flex items-center text-xs text-white/40">
        <span>View all students</span>
        <ChevronRight className="w-3 h-3 ml-1" />
      </div>
    </GlassCard>
  );
};

export default StudentsCard;
