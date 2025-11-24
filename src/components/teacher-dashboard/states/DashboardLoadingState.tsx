import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DashboardLoadingStateProps {
  rows?: number;
  showHeader?: boolean;
  wrapWithCard?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * Unified loading skeleton for teacher dashboard GET requests.
 * Keeps layout stable across sections while data is fetched.
 */
const DashboardLoadingState: React.FC<DashboardLoadingStateProps> = ({
  rows = 4,
  showHeader = true,
  wrapWithCard = true,
  className,
  contentClassName,
}) => {
  const content = (
    <div className={cn('space-y-3', contentClassName)}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="space-y-2">
          <Skeleton className="h-3 w-3/4 bg-white/10" />
          <Skeleton className="h-3 w-full bg-white/5" />
        </div>
      ))}
    </div>
  );

  if (!wrapWithCard) {
    return (
      <div className={cn('w-full', className)}>
        {showHeader && (
          <div className="space-y-2 mb-3">
            <Skeleton className="h-4 w-1/3 bg-white/10" />
            <Skeleton className="h-3 w-1/2 bg-white/10" />
          </div>
        )}
        {content}
      </div>
    );
  }

  return (
    <Card className={cn('bg-white/5 border-white/10', className)}>
      {showHeader && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-1/3 bg-white/10" />
          <Skeleton className="h-3 w-1/2 bg-white/10" />
        </CardHeader>
      )}
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default DashboardLoadingState;
