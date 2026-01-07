import React from 'react';
import { BookOpen, CheckCircle, XCircle, RotateCcw, UserX, Calendar } from 'lucide-react';
import { TeacherLessonsStats } from '@/types/api/teacherLesson';

interface LessonsStatsBarProps {
  stats: TeacherLessonsStats;
  totalCount: number;
}

/**
 * Statistics bar displaying teacher's lesson summary.
 * Shows total lessons and breakdown by status with semantic colors.
 */
const LessonsStatsBar: React.FC<LessonsStatsBarProps> = ({ stats, totalCount }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 md:gap-6 p-3 bg-white/[0.02] rounded-lg border border-white/10">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-white/60" />
        <span className="text-sm text-white/80">
          <span className="font-semibold text-white">{totalCount}</span>{' '}
          {totalCount === 1 ? 'lesson' : 'lessons'}
        </span>
      </div>

      {stats.scheduledCount > 0 && (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-white/80">
            <span className="font-semibold text-white">{stats.scheduledCount}</span> scheduled
          </span>
        </div>
      )}

      {stats.conductedCount > 0 && (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-white/80">
            <span className="font-semibold text-white">{stats.conductedCount}</span> conducted
          </span>
        </div>
      )}

      {stats.cancelledCount > 0 && (
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400" />
          <span className="text-sm text-white/80">
            <span className="font-semibold text-white">{stats.cancelledCount}</span> cancelled
          </span>
        </div>
      )}

      {stats.makeupCount > 0 && (
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-white/80">
            <span className="font-semibold text-white">{stats.makeupCount}</span> make up
          </span>
        </div>
      )}

      {stats.noShowCount > 0 && (
        <div className="flex items-center gap-2">
          <UserX className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-white/80">
            <span className="font-semibold text-white">{stats.noShowCount}</span> no show
          </span>
        </div>
      )}
    </div>
  );
};

export default LessonsStatsBar;
