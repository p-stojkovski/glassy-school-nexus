import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import { GradesOverview, PerformanceStatus } from '@/types/api/student';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PerformanceCardProps {
  grades: GradesOverview;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ grades }) => {
  const hasGrades = grades.status !== PerformanceStatus.NotAvailable;

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-medium text-white/60 mb-3">Performance</h3>

      {hasGrades ? (
        <div className="space-y-3">
          {/* Compact average display */}
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-lg font-semibold text-white">
                Current average
              </p>
              {grades.classAverage !== null && grades.classAverage !== undefined && (
                <p className="text-xs text-white/50 mt-0.5">
                  Class: {grades.classAverage.toFixed(1)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {grades.currentAverage?.toFixed(1) ?? '—'}
              </p>
            </div>
          </div>

          {/* Class average comparison - compact */}
          {grades.classAverage !== null && grades.classAverage !== undefined && grades.currentAverage && (
            <div className="flex items-center gap-1.5 text-xs">
              {grades.currentAverage > grades.classAverage && (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">Above class average</span>
                </>
              )}
              {grades.currentAverage < grades.classAverage && (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-yellow-400">Below class average</span>
                </>
              )}
              {grades.currentAverage === grades.classAverage && (
                <>
                  <Minus className="w-3.5 h-3.5 text-white/60" />
                  <span className="text-white/60">At class average</span>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-20">
          <p className="text-sm text-white/50">
            No assessments recorded yet.
          </p>
        </div>
      )}
    </GlassCard>
  );
};

export default PerformanceCard;
