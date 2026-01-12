/**
 * Salary Calculation Audit Log - Collapsible with Lazy Loading
 * Shows history of changes to a salary calculation
 * Pattern: Same as "Show Salary Preview" on Salary Calculations tab
 */
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import { useSalaryCalculationAuditLog } from '../hooks';
import type { SalaryAuditLog } from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface SalaryCalculationAuditLogProps {
  // Props removed - component now manages its own data via hook
}

const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    created: 'Generated',
    approved: 'Approved',
    adjusted: 'Adjusted',
    reopened: 'Reopened',
    recalculated: 'Recalculated',
  };
  return labels[action] || action.charAt(0).toUpperCase() + action.slice(1);
};

/**
 * Audit Log Content Component
 * Renders the actual audit log timeline
 */
const AuditLogContent: React.FC<{ auditLog: SalaryAuditLog[] }> = ({ auditLog }) => {
  if (auditLog.length === 0) {
    return (
      <Alert className="bg-white/5 border-white/10">
        <AlertDescription className="text-white/70">
          No audit log entries found.
        </AlertDescription>
      </Alert>
    );
  }

  const sortedLog = [...auditLog].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedLog.map((entry, index) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-white/40 mt-1.5" />
            {index < sortedLog.length - 1 && (
              <div className="w-px flex-1 bg-white/20 my-0.5" />
            )}
          </div>

          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-white font-medium text-sm">
                {getActionLabel(entry.action)}
              </span>
              <span className="text-white/50 text-xs">
                {formatRelativeTime(entry.createdAt)}
              </span>
            </div>

            {entry.previousAmount !== null && entry.newAmount !== null && (
              <div className="text-xs text-white/70 mb-1">
                {formatCurrency(entry.previousAmount)} → {formatCurrency(entry.newAmount)}
                {entry.previousAmount !== entry.newAmount && (
                  <span
                    className={
                      entry.newAmount > entry.previousAmount
                        ? 'text-green-400 ml-2'
                        : 'text-red-400 ml-2'
                    }
                  >
                    ({entry.newAmount > entry.previousAmount ? '+' : ''}
                    {formatCurrency(entry.newAmount - entry.previousAmount)})
                  </span>
                )}
              </div>
            )}

            {entry.reason && (
              <div className="text-xs text-white/60 bg-white/5 border border-white/10 rounded px-2 py-1.5 mt-1">
                {entry.reason}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Main Collapsible Audit Log Component
 * Lazy-loads audit data on first expand
 */
export const SalaryCalculationAuditLog: React.FC<SalaryCalculationAuditLogProps> = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { auditLogs, loading, error, refetch } = useSalaryCalculationAuditLog({
    isExpanded,
  });

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="space-y-2"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium"
        >
          <ChevronDown
            className={`h-4 w-4 mr-2 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
          {isExpanded ? 'Hide' : 'Show'} Audit Log
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2">
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Audit Log</CardTitle>
            <CardDescription className="text-white/60">
              History of changes to this calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : error ? (
              <ErrorMessage
                title="Error Loading Audit Log"
                message={error}
                onRetry={refetch}
                showRetry
              />
            ) : (
              <AuditLogContent auditLog={auditLogs} />
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};
