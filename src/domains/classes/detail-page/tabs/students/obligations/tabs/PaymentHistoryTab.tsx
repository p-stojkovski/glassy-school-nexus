/**
 * PaymentHistoryTab - Displays the complete payment history for a student.
 *
 * Features:
 * - Receives obligations from parent (ObligationsSidebar) to avoid N+1 queries
 * - Fetches payments for each obligation in parallel
 * - Aggregates and sorts payments by date (newest first)
 * - Shows payment date, amount, method, obligation description, and notes
 * - Handles loading, error, and empty states
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Receipt, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getObligationPayments } from '@/services/paymentsApiService';
import type {
  StudentObligationResponse,
  PaymentRecord,
} from '@/types/api/obligations';
import { PaymentHistoryItem } from '../components/PaymentHistoryItem';

export interface PaymentHistoryTabProps {
  /** Obligations data passed from parent - avoids duplicate fetch */
  obligations: StudentObligationResponse[];
}

/**
 * Extended payment record with obligation description for display.
 */
interface PaymentWithObligation extends PaymentRecord {
  obligationDescription: string;
}

export function PaymentHistoryTab({
  obligations,
}: PaymentHistoryTabProps) {
  const [payments, setPayments] = useState<PaymentWithObligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches payments for all obligations.
   * Obligations are passed from parent to avoid duplicate fetching.
   */
  const fetchPaymentHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (obligations.length === 0) {
        setPayments([]);
        return;
      }

      // Fetch payments for each obligation in parallel
      const paymentPromises = obligations.map(async (obligation: StudentObligationResponse) => {
        try {
          const paymentsResponse = await getObligationPayments(obligation.id);
          // Add obligation description to each payment
          return paymentsResponse.payments.map((payment: PaymentRecord) => ({
            ...payment,
            obligationDescription: obligation.description,
          }));
        } catch {
          // If fetching payments for one obligation fails, return empty array
          // This allows other payments to still be displayed
          console.warn(`Failed to fetch payments for obligation ${obligation.id}`);
          return [];
        }
      });

      const paymentArrays = await Promise.all(paymentPromises);

      // Flatten and sort by payment date (newest first)
      const allPayments = paymentArrays
        .flat()
        .sort((a, b) => {
          const dateA = new Date(a.paymentDate).getTime();
          const dateB = new Date(b.paymentDate).getTime();
          return dateB - dateA; // Descending order (newest first)
        });

      setPayments(allPayments);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load payment history';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [obligations]);

  // Fetch payment history when obligations change
  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/40 mb-4" />
        <p className="text-white/60 text-sm">Loading payment history...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-rose-400" />
        </div>
        <p className="text-white/70 text-sm mb-2">Failed to load payment history</p>
        <p className="text-white/50 text-xs mb-4">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPaymentHistory}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
          <Receipt className="w-6 h-6 text-white/40" />
        </div>
        <p className="text-white/70 text-sm">No payment history</p>
        <p className="text-white/50 text-xs mt-1">
          No payments have been recorded for this student yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/80 text-sm font-medium flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          All Payments ({payments.length})
        </h3>
      </div>

      {/* Payment List */}
      <div className="space-y-3">
        {payments.map((payment) => (
          <PaymentHistoryItem
            key={payment.id}
            paymentDate={payment.paymentDate}
            amount={payment.amount}
            paymentMethod={payment.paymentMethod}
            obligationDescription={payment.obligationDescription}
            referenceNumber={payment.referenceNumber}
            notes={payment.notes}
          />
        ))}
      </div>
    </div>
  );
}

export default PaymentHistoryTab;
