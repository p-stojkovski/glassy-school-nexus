import React, { useState, useEffect } from 'react';
import { History, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { LessonAuditEntry, LessonAuditHistoryResponse, LessonApiPaths } from '@/types/api/lesson';
import api from '@/services/api';

interface LessonEditHistoryProps {
  /** Lesson ID to fetch audit history for */
  lessonId: string;
  /** Whether to show the component (only show if hasAuditHistory is true) */
  hasAuditHistory: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Maps field_changed values to human-readable labels
 */
const FIELD_LABELS: Record<string, string> = {
  attendance: 'Attendance',
  homework_status: 'Homework Status',
  comments: 'Comments',
  lesson_notes: 'Lesson Notes',
  homework_assignment: 'Homework Assignment',
};

/**
 * Format date/time for display
 */
function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

/**
 * Truncate long values for display
 */
function truncateValue(value: string | null, maxLength = 50): string {
  if (!value) return '(empty)';
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength) + '...';
}

/**
 * Component to display lesson edit audit history.
 * Shows a collapsible list of all edits made during grace period.
 *
 * @example
 * ```tsx
 * {hasAuditHistory && (
 *   <LessonEditHistory lessonId={lesson.id} hasAuditHistory={hasAuditHistory} />
 * )}
 * ```
 */
const LessonEditHistory: React.FC<LessonEditHistoryProps> = ({
  lessonId,
  hasAuditHistory,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [entries, setEntries] = useState<LessonAuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch audit history when expanded
  useEffect(() => {
    if (!isExpanded || !hasAuditHistory) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<LessonAuditHistoryResponse>(
          LessonApiPaths.AUDIT_HISTORY(lessonId)
        );
        setEntries(response.entries);
      } catch (err) {
        console.error('Failed to fetch audit history:', err);
        setError('Failed to load edit history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [isExpanded, hasAuditHistory, lessonId]);

  if (!hasAuditHistory) return null;

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={cn(
        'bg-white/5 rounded-lg border border-white/[0.05]',
        className
      )}
    >
      <CollapsibleTrigger className="w-full px-3 py-2.5 border-b border-white/[0.05] bg-white/5 hover:bg-white/10 rounded-t-lg transition-colors">
        <div className="flex items-center justify-center gap-2">
          <ChevronDown
            className={cn(
              'w-4 h-4 text-white/60 transition-transform duration-200',
              !isExpanded && '-rotate-90'
            )}
          />
          <h3 className="text-md font-semibold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            Edit History
          </h3>
          <span className="text-xs text-white/50">
            (Grace period edits)
          </span>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="max-h-64 overflow-y-auto dark-scrollbar">
          {isLoading ? (
            <div className="text-center text-white/60 py-4">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-4">{error}</div>
          ) : entries.length === 0 ? (
            <div className="text-center text-white/60 py-4">No edit history found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.05] hover:bg-transparent">
                  <TableHead className="text-white/60 text-xs font-medium h-8 px-3">
                    Field
                  </TableHead>
                  <TableHead className="text-white/60 text-xs font-medium h-8 px-3">
                    Student
                  </TableHead>
                  <TableHead className="text-white/60 text-xs font-medium h-8 px-3">
                    Change
                  </TableHead>
                  <TableHead className="text-white/60 text-xs font-medium h-8 px-3 text-right">
                    When
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="border-white/[0.05] hover:bg-white/5"
                  >
                    {/* Field */}
                    <TableCell className="py-2 px-3 text-sm text-white font-medium">
                      {FIELD_LABELS[entry.fieldChanged] || entry.fieldChanged}
                    </TableCell>

                    {/* Student */}
                    <TableCell className="py-2 px-3 text-sm text-white/70">
                      {entry.studentName || '-'}
                    </TableCell>

                    {/* Change: Old -> New */}
                    <TableCell className="py-2 px-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-red-300/80 line-through">
                          {truncateValue(entry.oldValue)}
                        </span>
                        <span className="text-white/40">→</span>
                        <span className="text-green-300/80">
                          {truncateValue(entry.newValue)}
                        </span>
                      </div>
                    </TableCell>

                    {/* When */}
                    <TableCell className="py-2 px-3 text-xs text-white/50 text-right">
                      {formatDateTime(entry.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default LessonEditHistory;
