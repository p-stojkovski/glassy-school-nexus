/**
 * ObligationsOverviewTab - Displays student obligations with summary and payment actions.
 *
 * Features:
 * - Receives obligations from parent (ObligationsSidebar) to avoid duplicate fetches
 * - Shows summary totals (total owed, paid, remaining)
 * - Lists pending/partial obligations with "Register Payment" action
 * - Shows paid/cancelled obligations in a separate section
 * - Opens RegisterPaymentDialog when user clicks "Register Payment"
 */

import React, { useState } from 'react';
import { Receipt, CheckCircle2 } from 'lucide-react';
import { Amount } from '@/components/ui/amount';
import { mapResponseToStudentObligation } from '@/types/api/obligations';
import type {
  StudentObligationResponse,
  StudentObligation,
} from '@/types/api/obligations';
import { ObligationCard } from '../components/ObligationCard';
import RegisterPaymentDialog from '../../dialogs/RegisterPaymentDialog';

/**
 * Summary of obligation amounts - passed from parent to avoid duplicate calculation.
 */
export interface ObligationSummary {
  totalOwed: number;
  totalPaid: number;
  totalRemaining: number;
}

export interface ObligationsOverviewTabProps {
  /** Obligations data passed from parent */
  obligations: StudentObligationResponse[];
  /** Pre-calculated summary from parent */
  summary: ObligationSummary;
  /** Callback to refresh obligations after payment */
  onRefresh: () => void;
}

export function ObligationsOverviewTab({
  obligations,
  summary,
  onRefresh,
}: ObligationsOverviewTabProps) {
  // Payment dialog state
  const [selectedObligation, setSelectedObligation] = useState<StudentObligation | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  /**
   * Handles clicking "Register Payment" on an obligation card.
   */
  const handleRegisterPayment = (obligation: StudentObligationResponse) => {
    // Convert API response to StudentObligation for the dialog
    setSelectedObligation(mapResponseToStudentObligation(obligation));
    setPaymentDialogOpen(true);
  };

  /**
   * Handles successful payment - refreshes the obligations list via parent.
   */
  const handlePaymentSuccess = () => {
    onRefresh();
  };

  // Empty state
  if (obligations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
          <Receipt className="w-6 h-6 text-white/40" />
        </div>
        <p className="text-white/70 text-sm">No obligations found</p>
        <p className="text-white/50 text-xs mt-1">
          This student has no payment obligations yet
        </p>
      </div>
    );
  }

  // Separate active (pending/partial) from completed (paid/cancelled)
  const activeObligations = obligations.filter(
    (o) => o.status === 'pending' || o.status === 'partial'
  );
  const completedObligations = obligations.filter(
    (o) => o.status === 'paid' || o.status === 'cancelled'
  );

  return (
    <div className="space-y-4">
      {/* Summary Section */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Total Owed */}
          <div className="text-center">
            <p className="text-white/50 text-xs mb-1">Total Owed</p>
            <Amount
              value={summary.totalOwed}
              size="sm"
              weight="semibold"
              className="text-white"
            />
          </div>

          {/* Total Paid */}
          <div className="text-center">
            <p className="text-white/50 text-xs mb-1">Paid</p>
            <Amount
              value={summary.totalPaid}
              size="sm"
              weight="semibold"
              className="text-emerald-400"
            />
          </div>

          {/* Remaining */}
          <div className="text-center">
            <p className="text-white/50 text-xs mb-1">Remaining</p>
            <Amount
              value={summary.totalRemaining}
              size="sm"
              weight="semibold"
              className={summary.totalRemaining > 0 ? 'text-amber-400' : 'text-emerald-400'}
            />
          </div>
        </div>
      </div>

      {/* Active Obligations (Pending/Partial) */}
      {activeObligations.length > 0 && (
        <div>
          <h3 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Outstanding Obligations ({activeObligations.length})
          </h3>
          <div className="space-y-3">
            {activeObligations.map((obligation) => (
              <ObligationCard
                key={obligation.id}
                obligation={obligation}
                onRegisterPayment={() => handleRegisterPayment(obligation)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Paid Message (if no active obligations) */}
      {activeObligations.length === 0 && completedObligations.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-emerald-300 text-sm font-medium">All obligations paid</p>
            <p className="text-emerald-400/60 text-xs">
              This student has no outstanding payments
            </p>
          </div>
        </div>
      )}

      {/* Completed Obligations (Paid/Cancelled) */}
      {completedObligations.length > 0 && (
        <div>
          <h3 className="text-white/60 text-sm font-medium mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Completed ({completedObligations.length})
          </h3>
          <div className="space-y-3 opacity-75">
            {completedObligations.map((obligation) => (
              <ObligationCard
                key={obligation.id}
                obligation={obligation}
                onRegisterPayment={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Register Payment Dialog */}
      {selectedObligation && (
        <RegisterPaymentDialog
          obligation={selectedObligation}
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default ObligationsOverviewTab;
