import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import { BillingOverview, BillingStatus } from '@/types/api/student';

interface BillingCardProps {
  billing: BillingOverview;
}

const BillingCard: React.FC<BillingCardProps> = ({ billing }) => {
  const isNotImplemented = billing.status === BillingStatus.NotImplemented;
  const owesBalance = billing.status === BillingStatus.Owes;

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-medium text-white/60 mb-3">Billing</h3>

      {isNotImplemented ? (
        <div className="flex items-center justify-center h-20">
          <p className="text-sm text-white/50">
            Billing information not yet available.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Compact billing layout */}
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-lg font-semibold text-white">
                {owesBalance ? 'Outstanding' : 'Balance'}
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                Paid: ${billing.totalPaid.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${
                owesBalance ? 'text-red-300' : 'text-green-400'
              }`}>
                ${billing.outstandingBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Discount info */}
          {billing.hasDiscount && (
            <div className="text-xs text-green-400 pt-2 border-t border-white/10">
              <span className="text-white/50">Discount:</span> {billing.discountTypeName}
              {billing.discountAmount && billing.discountAmount > 0 && (
                <span> – {billing.discountAmount} MKD</span>
              )}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};

export default BillingCard;
