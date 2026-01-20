import React from 'react';
import { StudentHistorySummary } from '@/types/api/lesson-history';

/** Pre-loaded stats from the API response */
interface PreloadedStats {
  last5LateCount: number;
  last5MissingHwCount: number;
  last5AbsentCount: number;
}

interface StudentProgressChipProps {
  /** Summary from expansion hook (legacy/expanded state) */
  summary?: StudentHistorySummary | null;
  /** Pre-loaded stats from API - shown immediately without expansion */
  preloadedStats?: PreloadedStats;
  /** Loading state for expansion */
  isLoading?: boolean;
}

/**
 * StudentProgressChip - Shows a compact summary below the student name.
 *
 * This component displays a muted text summary of issues from the student's recent history.
 * It shows pre-loaded stats immediately (with "Last 5:" prefix) or expanded summary.
 *
 * Priority:
 * 1. If preloadedStats provided with non-zero values → show with "Last 5:" prefix
 * 2. If isLoading → show spinner
 * 3. If summary provided (from expansion) → show expanded summary
 *
 * Format: "Last 5: 2 late · 1 missing hw"
 */
const StudentProgressChip: React.FC<StudentProgressChipProps> = ({
  summary,
  preloadedStats,
  isLoading = false,
}) => {
  // Calculate values - prefer preloaded stats if available
  const absences = preloadedStats?.last5AbsentCount ?? summary?.absences ?? 0;
  const lateCount = preloadedStats?.last5LateCount ?? summary?.lateCount ?? 0;
  const missingHomework = preloadedStats?.last5MissingHwCount ?? summary?.missingHomework ?? 0;

  // Determine if we have any data to show
  const hasPreloadedData = preloadedStats && (
    preloadedStats.last5AbsentCount > 0 ||
    preloadedStats.last5LateCount > 0 ||
    preloadedStats.last5MissingHwCount > 0
  );

  // Loading state - only show spinner if no preloaded data is available
  if (isLoading && !hasPreloadedData) {
    return (
      <div className="flex items-center gap-1.5 mt-0.5">
        <div className="animate-spin rounded-full h-2.5 w-2.5 border border-white/20 border-t-white/40" />
        <span className="text-xs text-white/30">Loading...</span>
      </div>
    );
  }

  // Build summary text from non-zero values
  const parts: string[] = [];

  if (absences > 0) {
    parts.push(`${absences} absent`);
  }
  if (lateCount > 0) {
    parts.push(`${lateCount} late`);
  }
  if (missingHomework > 0) {
    parts.push(`${missingHomework} missing hw`);
  }

  // No issues - don't render anything
  if (parts.length === 0) {
    return null;
  }

  // Add "Last 5:" prefix for pre-loaded data
  const prefix = hasPreloadedData ? 'Last 5: ' : '';
  const text = prefix + parts.join(' · ');

  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <span className="text-xs text-white/50">{text}</span>
    </div>
  );
};

export default React.memo(StudentProgressChip);
