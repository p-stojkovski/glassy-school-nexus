import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  UserX,
  Clock
} from 'lucide-react';
import { LessonStatusName, LessonStatusColors } from '@/types/api/lesson';
import { cn } from '@/lib/utils';

interface LessonStatusBadgeProps {
  status: LessonStatusName;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

// Status colors follow semantic hierarchy:
// - Neutral (Scheduled, No Show): Low visual weight, doesn't compete for attention
// - Success (Conducted): Positive confirmation, subtle green
// - Info (Make Up): Informational, subtle blue-purple
// - Error (Cancelled): Problem state, uses rose for clear attention
const statusConfig = {
  'Scheduled': {
    icon: Calendar,
    label: 'Scheduled',
    colorClasses: 'bg-slate-500/15 text-slate-300 border-slate-500/20',
  },
  'Conducted': {
    icon: CheckCircle,
    label: 'Conducted',
    colorClasses: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  },
  'Cancelled': {
    icon: XCircle,
    label: 'Cancelled',
    colorClasses: 'bg-rose-500/20 text-rose-300 border-rose-500/25',
  },
  'Make Up': {
    icon: RotateCcw,
    label: 'Make Up',
    colorClasses: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  },
  'No Show': {
    icon: UserX,
    label: 'No Show',
    colorClasses: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  },
} as const;

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-2',
} as const;

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
} as const;

const LessonStatusBadge: React.FC<LessonStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  if (!config) {
    // Fallback for unknown status
    return (
      <Badge 
        variant="outline" 
        className={cn(
          'bg-gray-500/20 text-gray-300 border-gray-500/30',
          sizeClasses[size],
          className
        )}
      >
        {showIcon && <Clock className={cn(iconSizeClasses[size], 'mr-1')} />}
        {status}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.colorClasses,
        sizeClasses[size],
        'font-medium transition-colors',
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizeClasses[size], 'mr-1')} />}
      {config.label}
    </Badge>
  );
};

// Predefined status badge components for specific use cases
export const ScheduledBadge: React.FC<Omit<LessonStatusBadgeProps, 'status'>> = (props) => (
  <LessonStatusBadge status="Scheduled" {...props} />
);

export const ConductedBadge: React.FC<Omit<LessonStatusBadgeProps, 'status'>> = (props) => (
  <LessonStatusBadge status="Conducted" {...props} />
);

export const CancelledBadge: React.FC<Omit<LessonStatusBadgeProps, 'status'>> = (props) => (
  <LessonStatusBadge status="Cancelled" {...props} />
);

export const MakeUpBadge: React.FC<Omit<LessonStatusBadgeProps, 'status'>> = (props) => (
  <LessonStatusBadge status="Make Up" {...props} />
);

export const NoShowBadge: React.FC<Omit<LessonStatusBadgeProps, 'status'>> = (props) => (
  <LessonStatusBadge status="No Show" {...props} />
);

// Helper function to get status badge props
export const getStatusBadgeProps = (status: LessonStatusName) => {
  return statusConfig[status] || statusConfig['Scheduled'];
};

// Status summary component for displaying multiple status counts
interface LessonStatusSummaryProps {
  counts: {
    scheduled: number;
    conducted: number;
    cancelled: number;
    makeUp: number;
    noShow: number;
  };
  size?: 'sm' | 'md' | 'lg';
  showZeroCounts?: boolean;
  className?: string;
}

export const LessonStatusSummary: React.FC<LessonStatusSummaryProps> = ({
  counts,
  size = 'sm',
  showZeroCounts = false,
  className,
}) => {
  const statusItems = [
    { status: 'Scheduled' as const, count: counts.scheduled },
    { status: 'Conducted' as const, count: counts.conducted },
    { status: 'Cancelled' as const, count: counts.cancelled },
    { status: 'Make Up' as const, count: counts.makeUp },
    { status: 'No Show' as const, count: counts.noShow },
  ].filter(item => showZeroCounts || item.count > 0);

  if (statusItems.length === 0) {
    return (
      <div className={cn('text-white/60 text-sm', className)}>
        No lessons
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {statusItems.map(({ status, count }) => (
        <div key={status} className="flex items-center gap-1">
          <LessonStatusBadge 
            status={status} 
            size={size} 
            showIcon={false}
            className="min-w-0"
          />
          <span className="text-white/80 text-xs font-medium">
            {count}
          </span>
        </div>
      ))}
    </div>
  );
};

export default LessonStatusBadge;

