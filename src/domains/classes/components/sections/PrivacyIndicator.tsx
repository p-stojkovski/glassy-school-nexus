import React from 'react';
import InfoTooltip from '@/components/common/InfoTooltip';
import { Percent, CreditCard, Eye, EyeOff } from 'lucide-react';
import { StudentDiscountInfo, StudentPaymentObligationInfo } from '@/types/api/class';

interface DiscountIndicatorProps {
  discount?: StudentDiscountInfo | null;
  className?: string;
}

/**
 * Privacy-protected indicator for student discount information.
 * Shows a masked icon that reveals details on hover/click for privacy.
 */
export const DiscountIndicator: React.FC<DiscountIndicatorProps> = ({ 
  discount, 
  className = '' 
}) => {
  if (!discount?.hasDiscount) {
    return (
      <div className={`flex justify-center ${className}`}>
        <span className="text-white/40 text-sm">—</span>
      </div>
    );
  }

  const formatAmount = (amount?: number | null): string => {
    if (!amount) return '';
    return `${amount}%`;
  };

  // Build tooltip items
  const tooltipItems = [
    ...(discount.discountTypeName ? [{ label: 'Type', value: discount.discountTypeName }] : []),
    ...(discount.discountAmount ? [{ label: 'Amount', value: formatAmount(discount.discountAmount) }] : []),
  ];

  return (
    <InfoTooltip
      title="Discount Active"
      titleIcon={Percent}
      titleColor="text-emerald-300"
      items={tooltipItems}
    >
      <button
        className={`group flex items-center justify-center gap-1 p-1.5 rounded-lg 
          bg-emerald-500/10 border border-emerald-500/30 
          hover:bg-emerald-500/20 hover:border-emerald-500/50
          transition-all duration-200 cursor-pointer ${className}`}
        aria-label="View discount details"
      >
        <EyeOff className="w-3.5 h-3.5 text-emerald-400 group-hover:hidden" />
        <Eye className="w-3.5 h-3.5 text-emerald-300 hidden group-hover:block" />
        <Percent className="w-3.5 h-3.5 text-emerald-400" />
      </button>
    </InfoTooltip>
  );
};

interface PaymentObligationIndicatorProps {
  paymentObligation?: StudentPaymentObligationInfo | null;
  className?: string;
}

/**
 * Privacy-protected indicator for student payment obligations.
 * Shows a masked icon that reveals details on hover/click for privacy.
 * Note: Currently uses placeholder data until payment obligations feature is implemented.
 */
export const PaymentObligationIndicator: React.FC<PaymentObligationIndicatorProps> = ({ 
  paymentObligation, 
  className = '' 
}) => {
  if (!paymentObligation?.hasPendingObligations) {
    return (
      <div className={`flex justify-center ${className}`}>
        <span className="text-white/40 text-sm">—</span>
      </div>
    );
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Build tooltip items
  const tooltipItems = [
    { 
      label: 'Outstanding', 
      value: `${paymentObligation.pendingCount} ${paymentObligation.pendingCount === 1 ? 'payment' : 'payments'}` 
    },
    { label: 'Total', value: formatCurrency(paymentObligation.totalPendingAmount) },
  ];

  // Determine severity color based on pending count (calmer, tiered approach)
  const getSeverityColor = () => {
    if (paymentObligation.pendingCount >= 3) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50',
        icon: 'text-amber-400',
        iconHover: 'text-amber-300',
        titleColor: 'text-amber-300',
      };
    }
    if (paymentObligation.pendingCount >= 2) {
      return {
        bg: 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-500/50',
        icon: 'text-yellow-400',
        iconHover: 'text-yellow-300',
        titleColor: 'text-yellow-300',
      };
    }
    return {
      bg: 'bg-slate-500/10 border-slate-500/30 hover:bg-slate-500/20 hover:border-slate-500/50',
      icon: 'text-slate-400',
      iconHover: 'text-slate-300',
      titleColor: 'text-slate-300',
    };
  };

  const colors = getSeverityColor();

  return (
    <InfoTooltip
      title="Payments to review"
      titleIcon={CreditCard}
      titleColor={colors.titleColor}
      items={tooltipItems}
      footerNote="* Preview data - feature in development"
    >
      <button
        className={`group flex items-center justify-center gap-1 p-1.5 rounded-lg 
          ${colors.bg} border transition-all duration-200 cursor-pointer ${className}`}
        aria-label="View payment obligation details"
      >
        <EyeOff className={`w-3.5 h-3.5 ${colors.icon} group-hover:hidden`} />
        <Eye className={`w-3.5 h-3.5 ${colors.iconHover} hidden group-hover:block`} />
        <CreditCard className={`w-3.5 h-3.5 ${colors.icon}`} />
      </button>
    </InfoTooltip>
  );
};

export default { DiscountIndicator, PaymentObligationIndicator };
