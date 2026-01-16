import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormSheet } from '@/components/common/sheets';
import { classApiService } from '@/services/classApiService';
import { CreateScheduleSlotRequest, TimeSlotSuggestion } from '@/types/api/scheduleSlot';
import { ExistingScheduleOverlapInfo } from '@/types/api/scheduleValidation';
import { ClassBasicInfoResponse, ScheduleSlotDto } from '@/types/api/class';
import { ScheduleConflictPanel } from '@/domains/classes/_shared/components/ScheduleConflictPanel';
import { toast } from 'sonner';
import {
  DayTimeFields,
  SemesterSection,
  TimeSuggestionDialog,
  LessonGenerationSection,
} from './components';
import { useScheduleSlotSemesters } from './hooks';

interface AddScheduleSlotSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  classData: ClassBasicInfoResponse;
  initialSemesterId?: string | null;
  onSuccess: () => void;
}

interface FormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  generateLessons: boolean;
  rangeType: 'UntilYearEnd' | 'UntilSemesterEnd';
  semesterId: string | null;
}

export function AddScheduleSlotSheet({
  isOpen,
  onOpenChange,
  classId,
  classData,
  initialSemesterId = null,
  onSuccess,
}: AddScheduleSlotSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [endTimeTouched, setEndTimeTouched] = useState(false);
  const [endTimeAuto, setEndTimeAuto] = useState(false);
  const [hasConflicts, setHasConflicts] = useState(false);
  const [existingOverlap, setExistingOverlap] = useState<ExistingScheduleOverlapInfo | null>(null);

  // Time suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<TimeSlotSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Semester state via hook
  const {
    semesters,
    selectedSemesterId,
    setSelectedSemesterId,
    loadingSemesters,
  } = useScheduleSlotSemesters({
    academicYearId: classData?.academicYearId,
    isOpen,
    initialSemesterId,
  });

  const form = useForm<FormData>({
    defaultValues: {
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      generateLessons: false,
      rangeType: 'UntilYearEnd',
      semesterId: null,
    },
  });

  // Sync selectedSemesterId with form
  React.useEffect(() => {
    form.setValue('semesterId', selectedSemesterId);
  }, [selectedSemesterId, form]);

  const handleExistingOverlapChange = useCallback((overlap: ExistingScheduleOverlapInfo | null) => {
    setExistingOverlap(overlap);
  }, []);

  // Check if there's any overlap (exact or partial) - both block creation
  const hasAnyOverlap = existingOverlap?.hasOverlap ?? false;
  const generateLessons = form.watch('generateLessons');

  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    return (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  };

  const handleSuggestTimes = async () => {
    setLoadingSuggestions(true);
    setShowSuggestions(true);
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
    setShowSuggestions(false);
    toast.success(`Applied: ${suggestion.dayOfWeek} ${suggestion.startTime}-${suggestion.endTime}`);
  };

  const handleSubmit = async (data: FormData) => {
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
        if (skippedConflicts > 0) message += ` Skipped ${skippedConflicts} conflict(s).`;
        if (skippedHolidays > 0) message += ` Skipped ${skippedHolidays} holiday(s).`;
        toast.success(message, { duration: 6000 });
      } else {
        toast.success('Schedule slot created successfully');
      }

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create schedule slot';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEndTimeTouched(false);
      setEndTimeAuto(false);
      setHasConflicts(false);
      setExistingOverlap(null);
      setShowSuggestions(false);
      setSuggestions([]);
    }
    onOpenChange(open);
  };

  return (
    <>
      <FormSheet
        open={isOpen}
        onOpenChange={handleOpenChange}
        intent="primary"
        size="sm"
        icon={Calendar}
        title="Add session"
        confirmText="Create Schedule"
        cancelText="Cancel"
        onConfirm={form.handleSubmit(handleSubmit)}
        isLoading={isSubmitting}
        disabled={hasConflicts || hasAnyOverlap}
        isDirty={form.formState.isDirty}
      >
        <Form {...form}>
          <form className="space-y-6">
            {/* Day and Time Selection */}
            <DayTimeFields
              control={form.control}
              setValue={form.setValue}
              getValues={form.getValues}
              setError={form.setError}
              clearErrors={form.clearErrors}
              watch={form.watch}
              autoEndTime={true}
              endTimeAuto={endTimeAuto}
              endTimeTouched={endTimeTouched}
              onEndTimeAutoChange={setEndTimeAuto}
              onEndTimeTouchedChange={setEndTimeTouched}
            />

            {/* Semester Selection */}
            <SemesterSection
              academicYearId={classData?.academicYearId}
              selectedSemesterId={selectedSemesterId}
              onSemesterChange={setSelectedSemesterId}
              loadingSemesters={loadingSemesters}
              semesters={semesters}
            />

            {/* Conflict Check Panel */}
            <div className="my-6">
              <ScheduleConflictPanel
                classId={classId}
                dayOfWeek={form.watch('dayOfWeek')}
                startTime={form.watch('startTime')}
                endTime={form.watch('endTime')}
                generateLessons={form.watch('generateLessons')}
                rangeType={form.watch('rangeType')}
                onConflictsChange={setHasConflicts}
                onExistingOverlapChange={handleExistingOverlapChange}
                alwaysCheckOverlaps={true}
              />
            </div>

            {/* Suggest Times Button */}
            {(hasConflicts || existingOverlap?.hasOverlap) && (
              <div className="flex justify-center -mt-3 mb-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSuggestTimes}
                  disabled={loadingSuggestions}
                  className="text-xs text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {loadingSuggestions ? 'Finding available times...' : 'Suggest alternative times'}
                </Button>
              </div>
            )}

            {/* Lesson Generation */}
            <LessonGenerationSection
              control={form.control}
              generateLessons={generateLessons}
              hasConflicts={hasConflicts}
            />
          </form>
        </Form>
      </FormSheet>

      {/* Time Suggestions Dialog */}
      <TimeSuggestionDialog
        open={showSuggestions}
        onOpenChange={setShowSuggestions}
        suggestions={suggestions}
        loading={loadingSuggestions}
        onApply={handleApplySuggestion}
      />
    </>
  );
}

// Keep backward compatibility with old name
export { AddScheduleSlotSheet as AddScheduleSlotSidebar };
