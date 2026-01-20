import React from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LockedLessonBannerProps {
  /** Type of banner: 'locked' for read-only, 'grace' for audited edits */
  variant: 'locked' | 'grace';
  /** Message to display in the banner */
  message: string | null;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Banner component showing lesson locking status.
 * - Locked (red): Lesson is read-only, no edits allowed
 * - Grace (amber): Edits allowed but being audited
 *
 * @example
 * ```tsx
 * {isLocked && (
 *   <LockedLessonBanner variant="locked" message={lockMessage} />
 * )}
 * {isGracePeriod && !isLocked && (
 *   <LockedLessonBanner variant="grace" message={lockMessage} />
 * )}
 * ```
 */
const LockedLessonBanner: React.FC<LockedLessonBannerProps> = ({
  variant,
  message,
  className,
}) => {
  if (!message) return null;

  const isLocked = variant === 'locked';

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg',
        isLocked
          ? 'bg-red-500/10 border border-red-500/30 text-red-200'
          : 'bg-amber-500/10 border border-amber-500/30 text-amber-200',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {isLocked ? (
        <Lock className="w-5 h-5 flex-shrink-0" />
      ) : (
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      )}
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default LockedLessonBanner;
