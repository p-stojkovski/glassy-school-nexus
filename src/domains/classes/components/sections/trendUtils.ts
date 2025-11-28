import { TrendDirection } from './TrendIndicator';

/**
 * Calculates trend direction based on recent vs older performance
 * @param recentValue - Value from recent period (e.g., last 2 weeks)
 * @param olderValue - Value from older period (e.g., 2-4 weeks ago)
 * @param higherIsBetter - Whether higher values indicate improvement
 * @returns Trend direction
 */
export const calculateTrend = (
  recentValue: number,
  olderValue: number,
  higherIsBetter: boolean = true
): TrendDirection => {
  const threshold = 0.1; // 10% change threshold
  const change = olderValue > 0 ? (recentValue - olderValue) / olderValue : 0;
  
  if (Math.abs(change) < threshold) {
    return 'stable';
  }
  
  if (higherIsBetter) {
    return change > 0 ? 'improving' : 'declining';
  } else {
    return change < 0 ? 'improving' : 'declining';
  }
};

/**
 * Calculates attendance trend from lesson details
 * Compares recent lessons (first half) vs older lessons (second half)
 */
export const calculateAttendanceTrend = (
  presentCount: number,
  absentCount: number,
  totalLessons: number,
  recentAbsentCount?: number,
  recentTotalLessons?: number
): { direction: TrendDirection; tooltip: string } => {
  // If we don't have detailed recent data, use a simple heuristic
  if (recentAbsentCount === undefined || recentTotalLessons === undefined) {
    const absenceRate = totalLessons > 0 ? absentCount / totalLessons : 0;
    if (absenceRate > 0.3) {
      return { direction: 'declining', tooltip: 'High absence rate' };
    } else if (absenceRate < 0.1) {
      return { direction: 'improving', tooltip: 'Excellent attendance' };
    }
    return { direction: 'stable', tooltip: 'Attendance is stable' };
  }

  // Calculate absence rates for comparison
  const olderLessons = totalLessons - recentTotalLessons;
  const olderAbsences = absentCount - recentAbsentCount;
  
  const recentAbsenceRate = recentTotalLessons > 0 ? recentAbsentCount / recentTotalLessons : 0;
  const olderAbsenceRate = olderLessons > 0 ? olderAbsences / olderLessons : 0;
  
  // For absences, lower is better
  const direction = calculateTrend(recentAbsenceRate, olderAbsenceRate, false);
  
  const tooltips = {
    improving: 'Attendance improving over last 2 weeks',
    declining: 'Attendance declining over last 2 weeks',
    stable: 'Attendance stable over last 2 weeks',
  };
  
  return { direction, tooltip: tooltips[direction] };
};

/**
 * Calculates homework trend from lesson details
 */
export const calculateHomeworkTrend = (
  completeCount: number,
  missingCount: number,
  totalAssignments: number,
  recentMissingCount?: number,
  recentTotalAssignments?: number
): { direction: TrendDirection; tooltip: string } => {
  if (recentMissingCount === undefined || recentTotalAssignments === undefined) {
    const missingRate = totalAssignments > 0 ? missingCount / totalAssignments : 0;
    if (missingRate > 0.3) {
      return { direction: 'declining', tooltip: 'High missing homework rate' };
    } else if (missingRate < 0.1) {
      return { direction: 'improving', tooltip: 'Excellent homework completion' };
    }
    return { direction: 'stable', tooltip: 'Homework completion is stable' };
  }

  const olderAssignments = totalAssignments - recentTotalAssignments;
  const olderMissing = missingCount - recentMissingCount;
  
  const recentMissingRate = recentTotalAssignments > 0 ? recentMissingCount / recentTotalAssignments : 0;
  const olderMissingRate = olderAssignments > 0 ? olderMissing / olderAssignments : 0;
  
  // For missing homework, lower is better
  const direction = calculateTrend(recentMissingRate, olderMissingRate, false);
  
  const tooltips = {
    improving: 'Homework completion improving',
    declining: 'Homework completion declining',
    stable: 'Homework completion stable',
  };
  
  return { direction, tooltip: tooltips[direction] };
};
