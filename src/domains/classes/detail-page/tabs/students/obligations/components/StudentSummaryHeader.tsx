/**
 * StudentSummaryHeader - Displays student financial summary at the top of the sidebar.
 *
 * Shows a compact overview of the student's financial status including:
 * - Total amount due
 * - Amount paid
 * - Outstanding balance
 *
 * Data is passed from the parent ObligationsSidebar which centralizes
 * the obligations fetch to avoid duplicate API calls.
 */

import React from 'react';
import { DollarSign } from 'lucide-react';
import { Amount } from '@/components/ui/amount';

export interface StudentSummaryHeaderProps {
  /** Total amount due (from non-cancelled obligations) */
  totalDue: number;
  /** Total amount already paid */
  totalPaid: number;
  /** Outstanding balance remaining */
  outstanding: number;
}

export function StudentSummaryHeader({
  totalDue,
  totalPaid,
  outstanding,
}: StudentSummaryHeaderProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-white/60" />
        <span className="text-white/80 text-sm font-medium">
          Financial Summary
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Total Due */}
        <div className="text-center">
          <p className="text-white/50 text-xs mb-1">Total Due</p>
          <Amount
            value={totalDue}
            size="sm"
            weight="semibold"
            className="text-white"
          />
        </div>

        {/* Total Paid */}
        <div className="text-center">
          <p className="text-white/50 text-xs mb-1">Paid</p>
          <Amount
            value={totalPaid}
            size="sm"
            weight="semibold"
            className="text-green-400"
          />
        </div>

        {/* Outstanding */}
        <div className="text-center">
          <p className="text-white/50 text-xs mb-1">Outstanding</p>
          <Amount
            value={outstanding}
            size="sm"
            weight="semibold"
            className={outstanding > 0 ? 'text-amber-400' : 'text-green-400'}
          />
        </div>
      </div>
    </div>
  );
}

export default StudentSummaryHeader;
