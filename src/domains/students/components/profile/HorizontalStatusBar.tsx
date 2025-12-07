import React from 'react';
import { cn } from '@/lib/utils';

interface StatusSegment {
  value: number;
  color: string;
  label: string;
}

interface HorizontalStatusBarProps {
  segments: StatusSegment[];
  total: number;
}

const HorizontalStatusBar: React.FC<HorizontalStatusBarProps> = ({ segments, total }) => {
  if (total === 0) return null;

  return (
    <div className="space-y-1.5">
      {/* Progress bar */}
      <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
        {segments.map((segment, index) => {
          const percentage = (segment.value / total) * 100;
          if (percentage === 0) return null;

          return (
            <div
              key={index}
              className={cn('transition-all', segment.color)}
              style={{ width: `${percentage}%` }}
              title={`${segment.label}: ${segment.value}`}
            />
          );
        })}
      </div>

      {/* Compact legend */}
      <div className="flex gap-3 text-xs text-white/50">
        {segments.map((segment, index) => (
          segment.value > 0 && (
            <span key={index} className="flex items-center gap-1">
              <span className={cn('w-2 h-2 rounded-full', segment.color)} />
              <span>{segment.label} {segment.value}</span>
            </span>
          )
        ))}
      </div>
    </div>
  );
};

export default HorizontalStatusBar;
