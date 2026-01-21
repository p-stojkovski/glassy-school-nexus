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
 * This component displays color-coded issues from the student's recent history.
 * It shows pre-loaded stats immediately (with "Last 5:" prefix) or expanded summary.
 *
 * Colors:
 * - Red (text-red-400/60): absent, missing hw
 * - Amber (text-amber-400/60): late
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

  // Build colored parts from non-zero values
  const issues: React.ReactNode[] = [];

  if (absences > 0) {
    issues.push(
      <span key="absent" className="text-red-400/60">
        {absences} absent
      </span>
    );
  }
  if (lateCount > 0) {
    issues.push(
      <span key="late" className="text-amber-400/60">
        {lateCount} late
      </span>
    );
  }
  if (missingHomework > 0) {
    issues.push(
      <span key="missing" className="text-red-400/60">
        {missingHomework} missing hw
      </span>
    );
  }

  // No issues - don't render anything
  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center flex-wrap text-xs mt-0.5">
      {hasPreloadedData && <span className="text-white/50 mr-1">Last 5:</span>}
      {issues.map((issue, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-white/30 mx-1">·</span>}
          {issue}
        </React.Fragment>
      ))}
    </div>
  );
};

export default React.memo(StudentProgressChip);
