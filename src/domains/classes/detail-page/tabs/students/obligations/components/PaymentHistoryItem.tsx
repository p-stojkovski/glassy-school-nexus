/**
 * PaymentHistoryItem - Displays a single payment record in the payment history list.
 *
 * Shows:
 * - Payment date (e.g., "Jan 15, 2026")
 * - Amount paid
 * - Payment method icon (cash, card, bank)
 * - Obligation description (what the payment was for)
 * - Notes (if any)
 */

import React from 'react';
import { Banknote, CreditCard, Building2 } from 'lucide-react';
import { Amount } from '@/components/ui/amount';
import { format, parseISO } from 'date-fns';
import type { PaymentMethod } from '@/types/api/obligations';

export interface PaymentHistoryItemProps {
  /** Payment date (ISO format) */
  paymentDate: string;
  /** Amount paid */
  amount: number;
  /** Payment method */
  paymentMethod: PaymentMethod;
  /** Description of the obligation this payment was for */
  obligationDescription: string;
  /** Optional reference number */
  referenceNumber?: string;
  /** Optional notes */
  notes?: string;
}

/**
 * Payment method icons and labels
 */
const paymentMethodConfig: Record<
  PaymentMethod,
  { icon: React.ComponentType<{ className?: string }>; label: string; colorClass: string }
> = {
  cash: {
    icon: Banknote,
    label: 'Cash',
    colorClass: 'text-emerald-400 bg-emerald-500/10',
  },
  card: {
    icon: CreditCard,
    label: 'Card',
    colorClass: 'text-violet-400 bg-violet-500/10',
  },
  bank_transfer: {
    icon: Building2,
    label: 'Bank Transfer',
    colorClass: 'text-sky-400 bg-sky-500/10',
  },
};

/**
 * Formats a date string for display.
 */
function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function PaymentHistoryItem({
  paymentDate,
  amount,
  paymentMethod,
  obligationDescription,
  referenceNumber,
  notes,
}: PaymentHistoryItemProps) {
  const methodConfig = paymentMethodConfig[paymentMethod];
  const MethodIcon = methodConfig.icon;

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/[0.07] transition-colors">
      {/* Header: Date + Amount */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {/* Payment Method Icon */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${methodConfig.colorClass}`}
          >
            <MethodIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-white/90 text-sm font-medium">
              {formatDate(paymentDate)}
            </p>
            <p className="text-white/50 text-xs">{methodConfig.label}</p>
          </div>
        </div>
        <Amount
          value={amount}
          size="sm"
          weight="semibold"
          className="text-emerald-400"
        />
      </div>

      {/* Obligation Description */}
      <div className="mb-2">
        <p className="text-white/70 text-sm">{obligationDescription}</p>
      </div>

      {/* Reference Number (if any) */}
      {referenceNumber && (
        <div className="text-xs text-white/50 mb-1">
          <span className="text-white/40">Ref:</span> {referenceNumber}
        </div>
      )}

      {/* Notes (if any) */}
      {notes && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <p className="text-white/50 text-xs italic">{notes}</p>
        </div>
      )}
    </div>
  );
}

export default PaymentHistoryItem;
