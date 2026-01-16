import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { classApiService } from '@/services/classApiService';
import { CreateScheduleSlotRequest, TimeSlotSuggestion } from '@/types/api/scheduleSlot';
import { ExistingScheduleOverlapInfo } from '@/types/api/scheduleValidation';
import { ScheduleSlotDto } from '@/types/api/class';

export interface ScheduleSlotFormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  generateLessons: boolean;
  rangeType: 'UntilYearEnd' | 'UntilSemesterEnd' | 'Custom';
  semesterId: string | null;
}

interface UseScheduleSlotFormOptions {
  classId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function useScheduleSlotForm({ classId, onSuccess, onClose }: UseScheduleSlotFormOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [endTimeTouched, setEndTimeTouched] = useState(false);
  const [endTimeAuto, setEndTimeAuto] = useState(false);
  const [hasConflicts, setHasConflicts] = useState(false);
  const [existingOverlap, setExistingOverlap] = useState<ExistingScheduleOverlapInfo | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<TimeSlotSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);

  const form = useForm<ScheduleSlotFormData>({
    defaultValues: {
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      generateLessons: false,
      rangeType: 'UntilYearEnd',
      semesterId: null,
    },
  });

  const handleExistingOverlapChange = useCallback((overlap: ExistingScheduleOverlapInfo | null) => {
    setExistingOverlap(overlap);
  }, []);

  const hasAnyOverlap = existingOverlap?.hasOverlap ?? false;

  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    return endTotalMinutes - startTotalMinutes;
  };

  const handleSuggestTimes = async () => {
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(null);
    try {
      const duration = calculateDuration(form.getValues('startTime'), form.getValues('endTime'));
      const response = await classApiService.suggestAvailableTimeSlots(classId, {
        preferredDayOfWeek: form.getValues('dayOfWeek') as ScheduleSlotDto['dayOfWeek'],
        preferredStartTime: form.getValues('startTime'),
        duration,
        rangeType: form.getValues('rangeType'),
        maxSuggestions: 5,
      });
      setSuggestions(response.suggestions);
      if (response.suggestions.length > 0) {
        setSelectedSuggestionIndex(0);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch time suggestions';
      toast.error(errorMsg);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApplySuggestion = (suggestion: TimeSlotSuggestion) => {
    form.setValue('dayOfWeek', suggestion.dayOfWeek, { shouldValidate: true });
    form.setValue('startTime', suggestion.startTime, { shouldValidate: true });
    form.setValue('endTime', suggestion.endTime, { shouldValidate: true });
    setSelectedSuggestionIndex(null);
    setShowSuggestions(false);
    toast.success(`Applied: ${suggestion.dayOfWeek} ${suggestion.startTime}-${suggestion.endTime}`);
  };

  const handleSubmit = async (data: ScheduleSlotFormData) => {
    setIsSubmitting(true);

    try {
      const request: CreateScheduleSlotRequest = {
        dayOfWeek: data.dayOfWeek as ScheduleSlotDto['dayOfWeek'],
        startTime: data.startTime,
        endTime: data.endTime,
        semesterId: data.semesterId || null,
        generateLessons: data.generateLessons,
        generationOptions: data.generateLessons
          ? {
              rangeType: data.rangeType,
              skipConflicts: true,
              skipHolidays: true,
            }
          : undefined,
      };

      const response = await classApiService.createScheduleSlot(classId, request);

      if (response.generationSummary) {
        const { totalGenerated, skippedConflicts, skippedHolidays } = response.generationSummary;

        let message = `Schedule created! Generated ${totalGenerated} lesson(s).`;
        if (skippedConflicts > 0) {
          message += ` Skipped ${skippedConflicts} conflict(s).`;
        }
        if (skippedHolidays > 0) {
          message += ` Skipped ${skippedHolidays} holiday(s).`;
        }

        toast.success(message, { duration: 6000 });
      } else {
        toast.success('Schedule slot created successfully');
      }

      resetForm();
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create schedule slot';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setEndTimeTouched(false);
    setEndTimeAuto(false);
    setHasConflicts(false);
    setExistingOverlap(null);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(null);
  };

  return {
    form,
    isSubmitting,
    endTimeTouched,
    endTimeAuto,
    hasConflicts,
    existingOverlap,
    showSuggestions,
    suggestions,
    loadingSuggestions,
    selectedSuggestionIndex,
    hasAnyOverlap,
    setEndTimeTouched,
    setEndTimeAuto,
    setHasConflicts,
    setShowSuggestions,
    setSelectedSuggestionIndex,
    handleExistingOverlapChange,
    handleSuggestTimes,
    handleApplySuggestion,
    handleSubmit,
    resetForm,
  };
}
