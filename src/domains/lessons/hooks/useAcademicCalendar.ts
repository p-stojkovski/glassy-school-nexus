import { useState, useEffect } from 'react';
import academicCalendarApiService from '@/domains/settings/services/academicCalendarApi';
import { TeachingBreak } from '@/domains/settings/types/academicCalendarTypes';

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

export const useAcademicCalendar = (startDate: Date, endDate: Date): UseAcademicCalendarResult => {
  const [nonTeachingDays, setNonTeachingDays] = useState<NonTeachingDayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNonTeachingDays = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all academic years to find the relevant one(s)
        const academicYears = await academicCalendarApiService.getAllAcademicYears();
        
        // Find academic year that overlaps with our date range
        const relevantYear = academicYears.find(year => {
          const yearStart = new Date(year.startDate);
          const yearEnd = new Date(year.endDate);
          return yearStart <= endDate && yearEnd >= startDate;
        });

        if (!relevantYear) {
          setNonTeachingDays([]);
          return;
        }

        // Fetch teaching breaks for the relevant year (holidays are represented as breakType = 'holiday')
        let teachingBreaks: TeachingBreak[] = [];
        try {
          teachingBreaks = await academicCalendarApiService.getTeachingBreaksByYear(relevantYear.id);
        } catch (err: any) {
          // If 404, the year might not have breaks defined yet - treat as empty array
          if (err?.status === 404 || err?.message?.includes('404')) {
            console.warn(`No teaching breaks found for academic year ${relevantYear.id}`);
            teachingBreaks = [];
          } else {
            // Re-throw other errors
            throw err;
          }
        }

        const nonTeachingData: NonTeachingDayData[] = [];
        
        console.log('Academic Calendar Debug:', {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          relevantYear: relevantYear?.name,
          teachingBreaksCount: teachingBreaks.length
        });

        // Process teaching breaks
        teachingBreaks.forEach(breakItem => {
          const breakStart = new Date(breakItem.startDate);
          const breakEnd = new Date(breakItem.endDate);
          
          console.log('Processing break:', {
            name: breakItem.name,
            startDate: breakItem.startDate,
            endDate: breakItem.endDate,
            breakStartParsed: breakStart.toISOString(),
            breakEndParsed: breakEnd.toISOString()
          });
          
          // Check if break overlaps with our date range
          if (breakStart <= endDate && breakEnd >= startDate) {
            const isMultiDay = breakStart.getTime() !== breakEnd.getTime();
            
            // Generate all dates in the break period (inclusive of both start and end dates)
            const currentDate = new Date(Math.max(breakStart.getTime(), startDate.getTime()));
            const endLimit = new Date(Math.min(breakEnd.getTime(), endDate.getTime()));
            
            console.log('Date range for break:', {
              currentDate: currentDate.toISOString(),
              endLimit: endLimit.toISOString()
            });
            
            while (currentDate <= endLimit) {
              const dateString = currentDate.toISOString().split('T')[0];
              console.log('Adding break date:', dateString);
              
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

        console.log('Final non-teaching data:', nonTeachingData);
        setNonTeachingDays(nonTeachingData);
      } catch (err: any) {
        console.error('Failed to load academic calendar data:', err);
        setError(err?.message || 'Failed to load academic calendar data');
      } finally {
        setLoading(false);
      }
    };

    loadNonTeachingDays();
  }, [startDate.getTime(), endDate.getTime()]);

  return { nonTeachingDays, loading, error };
};