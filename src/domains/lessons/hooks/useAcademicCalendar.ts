import { useState, useEffect, useRef } from 'react';
import academicCalendarApiService from '@/domains/settings/services/academicCalendarApi';
import { AcademicYear, TeachingBreak } from '@/domains/settings/types/academicCalendarTypes';

interface NonTeachingDayData {
  date: string; // yyyy-mm-dd format
  type: 'teaching_break' | 'public_holiday' | 'vacation';
  name: string;
  isMultiDay?: boolean; // for teaching breaks that span multiple days
  // New: underlying break type from API (e.g., 'holiday', 'vacation', 'exam_period')
  breakType?: 'holiday' | 'vacation' | 'exam_period' | string;
}

interface UseAcademicCalendarResult {
  nonTeachingDays: NonTeachingDayData[];
  loading: boolean;
  error: string | null;
}

// Module-level cache to persist data across hook instances and re-renders
// This prevents redundant API calls when navigating between tabs
const academicYearsCache: { data: AcademicYear[] | null; timestamp: number } = { data: null, timestamp: 0 };
const teachingBreaksCache: Map<string, { data: TeachingBreak[]; timestamp: number }> = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_TTL_MS;
};

export const useAcademicCalendar = (startDate: Date, endDate: Date): UseAcademicCalendarResult => {
  const [nonTeachingDays, setNonTeachingDays] = useState<NonTeachingDayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we've already loaded data for this date range to prevent redundant calls
  const lastLoadedRangeRef = useRef<string | null>(null);

  useEffect(() => {
    const rangeKey = `${startDate.getTime()}-${endDate.getTime()}`;
    
    // Skip if we've already loaded this exact range
    if (lastLoadedRangeRef.current === rangeKey && nonTeachingDays.length >= 0) {
      return;
    }
    
    const loadNonTeachingDays = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get academic years from cache or fetch
        let academicYears: AcademicYear[];
        if (academicYearsCache.data && isCacheValid(academicYearsCache.timestamp)) {
          academicYears = academicYearsCache.data;
        } else {
          academicYears = await academicCalendarApiService.getAllAcademicYears();
          academicYearsCache.data = academicYears;
          academicYearsCache.timestamp = Date.now();
        }
        
        // Find academic year that overlaps with our date range
        const relevantYear = academicYears.find(year => {
          const yearStart = new Date(year.startDate);
          const yearEnd = new Date(year.endDate);
          return yearStart <= endDate && yearEnd >= startDate;
        });

        if (!relevantYear) {
          setNonTeachingDays([]);
          lastLoadedRangeRef.current = rangeKey;
          return;
        }

        // Get teaching breaks from cache or fetch
        let teachingBreaks: TeachingBreak[] = [];
        const cachedBreaks = teachingBreaksCache.get(relevantYear.id);
        
        if (cachedBreaks && isCacheValid(cachedBreaks.timestamp)) {
          teachingBreaks = cachedBreaks.data;
        } else {
          try {
            teachingBreaks = await academicCalendarApiService.getTeachingBreaksByYear(relevantYear.id);
            teachingBreaksCache.set(relevantYear.id, { data: teachingBreaks, timestamp: Date.now() });
          } catch (err: any) {
            // If 404, the year might not have breaks defined yet - treat as empty array
            if (err?.status === 404 || err?.message?.includes('404')) {
              console.warn(`No teaching breaks found for academic year ${relevantYear.id}`);
              teachingBreaks = [];
              teachingBreaksCache.set(relevantYear.id, { data: [], timestamp: Date.now() });
            } else {
              // Re-throw other errors
              throw err;
            }
          }
        }

        const nonTeachingData: NonTeachingDayData[] = [];

        // Process teaching breaks
        teachingBreaks.forEach(breakItem => {
          const breakStart = new Date(breakItem.startDate);
          const breakEnd = new Date(breakItem.endDate);
          
          // Check if break overlaps with our date range
          if (breakStart <= endDate && breakEnd >= startDate) {
            const isMultiDay = breakStart.getTime() !== breakEnd.getTime();
            
            // Generate all dates in the break period (inclusive of both start and end dates)
            const currentDate = new Date(Math.max(breakStart.getTime(), startDate.getTime()));
            const endLimit = new Date(Math.min(breakEnd.getTime(), endDate.getTime()));
            
            while (currentDate <= endLimit) {
              const dateString = currentDate.toISOString().split('T')[0];
              
              nonTeachingData.push({
                date: dateString,
                type: 'teaching_break',
                name: breakItem.name,
                isMultiDay,
                breakType: (breakItem as any).breakType,
              });
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        });

        // Derive single-day holiday markers from teaching breaks with breakType = 'holiday'
        teachingBreaks.forEach(breakItem => {
          if ((breakItem as any).breakType === 'holiday') {
            const holidayStart = new Date(breakItem.startDate);
            const holidayEnd = new Date(breakItem.endDate);

            // If it's a single-day holiday within range, add a 'public_holiday' marker for calendar styling parity
            if (
              holidayStart.getTime() === holidayEnd.getTime() &&
              holidayStart >= startDate && holidayStart <= endDate
            ) {
              nonTeachingData.push({
                date: holidayStart.toISOString().split('T')[0],
                type: 'public_holiday', // legacy label for UI parity
                name: breakItem.name,
                isMultiDay: false,
                breakType: 'holiday',
              });
            }
          }
        });

        setNonTeachingDays(nonTeachingData);
        lastLoadedRangeRef.current = rangeKey;
      } catch (err: any) {
        console.error('Failed to load academic calendar data:', err);
        setError(err?.message || 'Failed to load academic calendar data');
      } finally {
        setLoading(false);
      }
    };

    loadNonTeachingDays();
  }, [startDate.getTime(), endDate.getTime(), nonTeachingDays.length]);

  return { nonTeachingDays, loading, error };
};

// Utility to clear cache (useful when academic calendar data is modified)
export const clearAcademicCalendarCache = (): void => {
  academicYearsCache.data = null;
  academicYearsCache.timestamp = 0;
  teachingBreaksCache.clear();
};