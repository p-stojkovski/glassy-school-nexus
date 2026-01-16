import { useState, useEffect } from 'react';
import { academicCalendarApiService } from '@/services/academicCalendarApiService';
import { AcademicSemesterResponse } from '@/types/api/academic-calendar';

interface UseScheduleSlotSemestersOptions {
  academicYearId: string | undefined;
  isOpen: boolean;
  initialSemesterId?: string | null;
}

interface UseScheduleSlotSemestersResult {
  semesters: AcademicSemesterResponse[];
  selectedSemesterId: string | null;
  setSelectedSemesterId: (id: string | null) => void;
  loadingSemesters: boolean;
}

/**
 * Hook to manage semester selection state for schedule slot forms.
 * Fetches active semesters for an academic year and manages selection.
 */
export function useScheduleSlotSemesters({
  academicYearId,
  isOpen,
  initialSemesterId = null,
}: UseScheduleSlotSemestersOptions): UseScheduleSlotSemestersResult {
  const [semesters, setSemesters] = useState<AcademicSemesterResponse[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  // Fetch semesters for the class's academic year (on mount/open)
  useEffect(() => {
    if (!academicYearId || !isOpen) return;

    const fetchSemesters = async () => {
      setLoadingSemesters(true);
      try {
        const semestersList = await academicCalendarApiService.getSemestersForYear(academicYearId);
        // Filter out deleted semesters
        const activeSemesters = semestersList.filter((s) => !s.isDeleted);
        setSemesters(activeSemesters);
      } catch (err) {
        console.error('Failed to load semesters:', err);
      } finally {
        setLoadingSemesters(false);
      }
    };

    fetchSemesters();
  }, [academicYearId, isOpen]);

  // Set initial semester when opening
  useEffect(() => {
    if (isOpen && initialSemesterId !== undefined) {
      setSelectedSemesterId(initialSemesterId);
    }
  }, [isOpen, initialSemesterId]);

  return {
    semesters,
    selectedSemesterId,
    setSelectedSemesterId,
    loadingSemesters,
  };
}
