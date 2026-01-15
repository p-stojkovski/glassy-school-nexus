import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';

const amountVariants = cva(
  'tabular-nums', // Always applied for decimal alignment
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
    },
    defaultVariants: {
      size: 'md',
      weight: 'medium',
    },
  }
);

export interface AmountProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof amountVariants> {
  value: number;
  showSign?: boolean;
  colorBySign?: boolean;
  asChild?: boolean;
}

const Amount = React.forwardRef<HTMLSpanElement, AmountProps>(
  ({ value, showSign, colorBySign, size, weight, className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'span';

    const signPrefix = showSign && value > 0 ? '+' : '';
    const colorClass = colorBySign
      ? value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : ''
      : '';

    return (
      <Comp
        ref={ref}
        className={cn(amountVariants({ size, weight }), colorClass, className)}
        {...props}
      >
        {signPrefix}{formatCurrency(value)}
      </Comp>
    );
  }
);
Amount.displayName = 'Amount';

export { Amount, amountVariants };
