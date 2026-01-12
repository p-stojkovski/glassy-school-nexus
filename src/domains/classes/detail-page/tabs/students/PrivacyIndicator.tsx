import React from 'react';
import { StudentDiscountInfo, StudentPaymentObligationInfo } from '@/types/api/class';

interface DiscountIndicatorProps {
  discount?: StudentDiscountInfo | null;
  className?: string;
}

/**
 * Text-based indicator for student discount information.
 * Shows discount amount with type name inline (no hover required).
 * Displays in neutral/muted text color.
 */
export const DiscountIndicator: React.FC<DiscountIndicatorProps> = ({
  discount,
  className = ''
}) => {
  if (!discount?.hasDiscount) {
    return null;
  }

  const amount = discount.discountAmount ?? 0;
  const typeName = discount.discountTypeName;

  // Format: "150 MKD - Sibling" or just "150 MKD" if no type name
  const displayText = typeName
    ? `${amount} MKD - ${typeName}`
    : `${amount} MKD`;

  return (
    <span className={`text-white/60 text-sm ${className}`}>
      {displayText}
    </span>
  );
};

interface PaymentObligationIndicatorProps {
  paymentObligation?: StudentPaymentObligationInfo | null;
  className?: string;
}

/**
 * Text-based indicator for student payment obligations.
 * Shows amount due inline with severity-based coloring (no hover required).
 */
export const PaymentObligationIndicator: React.FC<PaymentObligationIndicatorProps> = ({
  paymentObligation,
  className = ''
}) => {
  if (!paymentObligation?.hasPendingObligations) {
    return null;
  }

  const count = paymentObligation.pendingCount;
  const totalAmount = paymentObligation.totalPendingAmount;

  // Severity-based text color (kept for amounts due as it indicates action needed)
  const colorClass = count >= 3
    ? 'text-amber-400'
    : count >= 2
    ? 'text-yellow-400'
    : 'text-slate-400';

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('mk-MK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' MKD';
  };

  // Format: "168 MKD due" or "3 pending" if multiple obligations
  const displayText = count === 1
    ? `${formatCurrency(totalAmount)} due`
    : `${count} pending`;

  return (
    <span className={`${colorClass} text-sm ${className}`}>
      {displayText}
    </span>
  );
};

export default { DiscountIndicator, PaymentObligationIndicator };
