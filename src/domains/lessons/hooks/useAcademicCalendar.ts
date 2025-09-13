import { useState, useEffect } from 'react';
import academicCalendarApiService from '@/domains/settings/services/academicCalendarApi';
import { TeachingBreak, PublicHoliday } from '@/domains/settings/types/academicCalendarTypes';

interface NonTeachingDayData {
  date: string; // yyyy-mm-dd format
  type: 'teaching_break' | 'public_holiday' | 'vacation';
  name: string;
  isMultiDay?: boolean; // for teaching breaks that span multiple days
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

        // Fetch teaching breaks and public holidays for the relevant year
        const [teachingBreaks, publicHolidays] = await Promise.all([
          academicCalendarApiService.getTeachingBreaksByYear(relevantYear.id),
          academicCalendarApiService.getPublicHolidaysByYear(relevantYear.id)
        ]);

        const nonTeachingData: NonTeachingDayData[] = [];
        
        console.log('Academic Calendar Debug:', {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          relevantYear: relevantYear?.name,
          teachingBreaksCount: teachingBreaks.length,
          publicHolidaysCount: publicHolidays.length
        });
        console.log('Public Holidays:', publicHolidays);

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
                isMultiDay
              });
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        });

        // Process public holidays
        publicHolidays.forEach(holiday => {
          const holidayDate = new Date(holiday.date);
          
          // Check if holiday falls within our date range
          if (holidayDate >= startDate && holidayDate <= endDate) {
            nonTeachingData.push({
              date: holidayDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
              type: 'public_holiday',
              name: holiday.name,
              isMultiDay: false
            });
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