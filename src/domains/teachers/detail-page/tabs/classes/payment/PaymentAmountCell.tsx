import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';

interface PaymentAmountCellProps {
  amount: number | null | undefined;
  className?: string;
  showZero?: boolean;
  variant?: 'default' | 'total' | 'subtotal';
}

/**
 * Reusable payment amount display component for consistent currency formatting.
 * Handles null, undefined, and zero amounts with configurable display options.
 */
export function PaymentAmountCell({
  amount,
  className,
  showZero = false,
  variant = 'default',
}: PaymentAmountCellProps) {
  if (amount === null || amount === undefined) {
    return <span className={cn('text-muted-foreground', className)}>-</span>;
  }

  if (amount === 0 && !showZero) {
    return <span className={cn('text-muted-foreground', className)}>-</span>;
  }

  const formattedAmount = formatCurrency(amount);

  const variantClasses = {
    default: '',
    total: 'font-semibold',
    subtotal: 'text-sm text-muted-foreground',
  };

  return (
    <span className={cn('tabular-nums', variantClasses[variant], className)}>
      {formattedAmount}
    </span>
  );
}
