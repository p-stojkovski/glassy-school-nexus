import React, { useState, useEffect } from 'react';
import { History, Loader2 } from 'lucide-react';
import { ViewSheet } from '@/components/common/sheets/ViewSheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LessonAuditEntry, LessonAuditHistoryResponse, LessonApiPaths } from '@/types/api/lesson';
import api from '@/services/api';

interface LessonEditHistorySidebarProps {
  /** Lesson ID to fetch audit history for */
  lessonId: string;
  /** Control the open state */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
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
 * Sidebar component to display lesson edit audit history.
 * Shows a list of all edits made during grace period in a right-side sheet.
 *
 * @example
 * ```tsx
 * <LessonEditHistorySidebar
 *   lessonId={lesson.id}
 *   open={showEditHistorySidebar}
 *   onOpenChange={setShowEditHistorySidebar}
 * />
 * ```
 */
const LessonEditHistorySidebar: React.FC<LessonEditHistorySidebarProps> = ({
  lessonId,
  open,
  onOpenChange,
}) => {
  const [entries, setEntries] = useState<LessonAuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch audit history when opened
  useEffect(() => {
    if (!open) return;

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
  }, [open, lessonId]);

  return (
    <ViewSheet
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      intent="primary"
      icon={History}
      title="Edit History"
      description="Grace period edits"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center text-white/60 py-12">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p>Loading edit history...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-400 py-12">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center text-white/60 py-12">
          <History className="w-12 h-12 mx-auto mb-4 text-white/30" />
          <p className="text-lg font-semibold mb-2">No edit history found</p>
          <p className="text-sm">No changes have been made during the grace period</p>
        </div>
      ) : (
        <div className="bg-white/5 rounded-lg border border-white/[0.05] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.05] hover:bg-transparent">
                <TableHead className="text-white/70 font-semibold h-10 px-4">
                  Field
                </TableHead>
                <TableHead className="text-white/70 font-semibold h-10 px-4">
                  Student
                </TableHead>
                <TableHead className="text-white/70 font-semibold h-10 px-4">
                  Change
                </TableHead>
                <TableHead className="text-white/70 font-semibold h-10 px-4 text-right">
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
                  <TableCell className="py-3 px-4 text-sm text-white font-medium">
                    {FIELD_LABELS[entry.fieldChanged] || entry.fieldChanged}
                  </TableCell>

                  {/* Student */}
                  <TableCell className="py-3 px-4 text-sm text-white/70">
                    {entry.studentName || '-'}
                  </TableCell>

                  {/* Change: Old -> New */}
                  <TableCell className="py-3 px-4 text-sm">
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
                  <TableCell className="py-3 px-4 text-xs text-white/50 text-right">
                    {formatDateTime(entry.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </ViewSheet>
  );
};

export default LessonEditHistorySidebar;
