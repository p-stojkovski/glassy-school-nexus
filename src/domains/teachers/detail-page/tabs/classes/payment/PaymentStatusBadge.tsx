import { CheckCircle2, MinusCircle, AlertCircle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaymentStatus = 'paid' | 'partial' | 'due';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
  showIcon?: boolean;
  /** Custom content to display instead of the default status label */
  children?: React.ReactNode;
}

interface StatusConfig {
  icon: LucideIcon;
  label: string;
  className: string;
}

const statusConfig: Record<PaymentStatus, StatusConfig> = {
  paid: {
    icon: CheckCircle2,
    label: 'Paid',
    className: 'text-green-400 bg-green-500/10',
  },
  partial: {
    icon: MinusCircle,
    label: 'Partial',
    className: 'text-amber-400 bg-amber-500/10',
  },
  due: {
    icon: AlertCircle,
    label: 'Due',
    className: 'text-red-400 bg-red-500/10',
  },
};

/**
 * Reusable payment status badge component.
 * Displays a colored pill with icon and label indicating payment status.
 */
export function PaymentStatusBadge({
  status,
  className,
  showIcon = true,
  children,
}: PaymentStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{children ?? config.label}</span>
    </div>
  );
}
