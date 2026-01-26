/**
 * AuditLogTab Component
 * Displays salary calculation audit history timeline
 * Extracted from SalaryDetailTabs.tsx for better maintainability
 */
import { useSalaryCalculationAuditLog } from '../../hooks/useSalaryCalculationAuditLog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatRelativeTime } from '@/utils/formatters';

interface AuditLogTabProps {
  calculationId: string;
}

const actionLabels: Record<string, string> = {
  created: 'Generated',
  approved: 'Approved',
  adjusted: 'Adjusted',
  reopened: 'Reopened',
  recalculated: 'Recalculated',
  adjustment_added: 'Adjustment Added',
  adjustment_removed: 'Adjustment Removed',
};

export function AuditLogTab({ calculationId }: AuditLogTabProps) {
  // Note: calculationId prop available for future use; hook currently uses useParams()
  const { auditLogs, loading, error } = useSalaryCalculationAuditLog({ isExpanded: true });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (error || auditLogs.length === 0) {
    return (
      <div className="text-center py-8 text-white/50 text-sm">
        {error || 'No history available'}
      </div>
    );
  }

  const sorted = [...auditLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-2 py-2">
      {sorted.map((entry) => (
        <div
          key={entry.id}
          className="flex items-start gap-3 text-sm"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-1.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white/80 font-medium">
                {actionLabels[entry.action] || entry.action}
              </span>
              <span className="text-white/40 text-xs">
                {formatRelativeTime(entry.createdAt)}
              </span>
            </div>
            {entry.previousAmount !== null && entry.newAmount !== null && (
              <div className="text-white/50 text-xs mt-0.5">
                {entry.previousAmount.toLocaleString()} → {entry.newAmount.toLocaleString()} MKD
              </div>
            )}
            {entry.reason && (
              <div className="text-white/40 text-xs mt-1 bg-white/5 rounded px-2 py-1">
                {entry.reason}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
