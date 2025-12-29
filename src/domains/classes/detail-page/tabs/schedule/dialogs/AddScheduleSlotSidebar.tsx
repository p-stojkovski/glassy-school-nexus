import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, X, Info, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TimeCombobox } from '@/components/common';
import SemestersDropdown from '@/components/common/SemestersDropdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { classApiService } from '@/services/classApiService';
import { academicCalendarApiService } from '@/services/academicCalendarApiService';
import { CreateScheduleSlotRequest, TimeSlotSuggestion } from '@/types/api/scheduleSlot';
import { ExistingScheduleOverlapInfo } from '@/types/api/scheduleValidation';
import { ClassBasicInfoResponse } from '@/types/api/class';
import { AcademicSemesterResponse } from '@/types/api/academic-calendar';
import { ScheduleConflictPanel } from '@/domains/classes/_shared/components/ScheduleConflictPanel';
import { toast } from 'sonner';

interface AddScheduleSlotSidebarProps {
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
  rangeType: 'UntilYearEnd' | 'UntilSemesterEnd' | 'Custom';
  semesterId: string | null;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const addOneHourWithCap = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  if (hours >= 23) {
    return '23:59';
  }
  const newHour = hours + 1;
  return `${newHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export function AddScheduleSlotSidebar({ isOpen, onOpenChange, classId, classData, initialSemesterId = null, onSuccess }: AddScheduleSlotSidebarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [endTimeTouched, setEndTimeTouched] = useState(false);
  const [endTimeAuto, setEndTimeAuto] = useState(false);
  const [hasConflicts, setHasConflicts] = useState(false);
  const [existingOverlap, setExistingOverlap] = useState<ExistingScheduleOverlapInfo | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<TimeSlotSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);

  // Semester state
  const [semesters, setSemesters] = useState<AcademicSemesterResponse[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  // Form must be initialized before effects that reference it
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

  const handleExistingOverlapChange = useCallback((overlap: ExistingScheduleOverlapInfo | null) => {
    setExistingOverlap(overlap);
  }, []);

  // Fetch semesters for the class's academic year (on mount)
  useEffect(() => {
    if (!classData?.academicYearId || !isOpen) return;

    const fetchSemesters = async () => {
      setLoadingSemesters(true);
      try {
        const semestersList = await academicCalendarApiService.getSemestersForYear(
          classData.academicYearId
        );
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
  }, [classData?.academicYearId, isOpen]);

  // Sync selectedSemesterId with form
  useEffect(() => {
    form.setValue('semesterId', selectedSemesterId);
  }, [selectedSemesterId, form]);

  // Prefill semester when opening from filtered context
  useEffect(() => {
    if (isOpen) {
      setSelectedSemesterId(initialSemesterId ?? null);
      form.setValue('semesterId', initialSemesterId ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Check if there's any overlap (exact or partial) - both block creation
  // Teacher and classroom are occupied during any overlapping time
  const hasAnyOverlap = existingOverlap?.hasOverlap ?? false;
  const hasExactOverlap = existingOverlap?.overlaps.some(o => o.overlapType === 'exact') ?? false;

  const generateLessons = form.watch('generateLessons');

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const request: CreateScheduleSlotRequest = {
        dayOfWeek: data.dayOfWeek as any,
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

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create schedule slot');
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
      setSelectedSuggestionIndex(null);
      setSelectedSemesterId(null);
    }
    onOpenChange(open);
  };

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
        preferredDayOfWeek: form.getValues('dayOfWeek') as any,
        preferredStartTime: form.getValues('startTime'),
        duration,
        rangeType: form.getValues('rangeType'),
        maxSuggestions: 5,
      });
      setSuggestions(response.suggestions);
      if (response.suggestions.length > 0) {
        setSelectedSuggestionIndex(0);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch time suggestions');
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

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-4 py-4 border-b border-white/10">
            <SheetTitle className="flex items-center gap-2 text-white text-lg font-semibold">
              <Calendar className="w-5 h-5 text-yellow-400" />
              Add session
            </SheetTitle>
          </SheetHeader>

          {/* Form Content */}
          <ScrollArea className="flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-4">
                {/* Day and Time Selection */}
                <div className="space-y-4">
                  {/* Day of Week */}
                  <FormField
                    control={form.control}
                    name="dayOfWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Day of Week</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-white/20">
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day} value={day} className="text-white hover:bg-white/10 focus:bg-white/10">
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <TimeCombobox
                          label="Start Time"
                          showIcon={false}
                          value={field.value}
                          onChange={(newStart) => {
                            field.onChange(newStart);

                            const currentEnd = form.getValues('endTime');
                            const hasEnd = !!currentEnd && currentEnd.trim().length > 0;
                            const computedAutoEnd = addOneHourWithCap(newStart);

                            const shouldAutoSet =
                              !hasEnd ||
                              endTimeAuto ||
                              !endTimeTouched ||
                              (hasEnd && currentEnd <= newStart);

                            if (shouldAutoSet) {
                              form.setValue('endTime', computedAutoEnd, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              setEndTimeAuto(true);
                              setEndTimeTouched(false);
                            }

                            form.clearErrors('endTime');
                          }}
                          placeholder="9:00 AM"
                          startHour={7}
                          endHour={21}
                          intervalMinutes={30}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <TimeCombobox
                          label="End Time"
                          showIcon={false}
                          value={field.value}
                          onChange={(newEnd) => {
                            const start = form.getValues('startTime');
                            if (start && newEnd <= start) {
                              form.setError('endTime', {
                                type: 'manual',
                                message: 'End time must be after start time',
                              });
                              return;
                            }

                            form.clearErrors('endTime');
                            field.onChange(newEnd);
                            setEndTimeTouched(true);
                            setEndTimeAuto(false);
                          }}
                          placeholder="10:00 AM"
                          min={form.watch('startTime')}
                          startHour={7}
                          endHour={21}
                          intervalMinutes={30}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                </div>

                {/* Semester Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-white text-sm font-medium">Semester (Optional)</FormLabel>
                  </div>
                  <SemestersDropdown
                    academicYearId={classData?.academicYearId}
                    value={selectedSemesterId || ''}
                    onValueChange={(id) => setSelectedSemesterId(id || null)}
                    placeholder="All semesters (Global)"
                    disabled={loadingSemesters || !classData?.academicYearId}
                    showDateRangeInfo={true}
                    onError={(message) => {
                      console.error('Failed to load semesters:', message);
                    }}
                  />
                  {!classData?.academicYearId && (
                    <div className="text-xs text-red-300 mt-2">
                      This class has no academic year. Semester selection is disabled.
                    </div>
                  )}
                  {classData?.academicYearId && !loadingSemesters && semesters.length === 0 && (
                    <div className="text-xs text-white/60 mt-2">
                      No semesters defined for this academic year. Create semesters in Academic Calendar settings.
                    </div>
                  )}
                </div>

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

                {/* Suggest Times Button - Shows when conflicts detected or existing overlaps found */}
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
                <div className="border-t border-white/20 pt-4 space-y-3">
                  <FormField
                    control={form.control}
                    name="generateLessons"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5 border-white/30 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                          />
                        </FormControl>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <FormLabel className="font-medium cursor-pointer text-white">
                              Generate lessons for this schedule
                            </FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-white/40 hover:text-white/60 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                  <p>Lessons will be created for matching days. Conflicts and holidays are automatically skipped.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <p className="text-sm text-white/60">
                            Automatically create lessons for matching dates
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {generateLessons && !hasConflicts && (
                    <div className="pl-7 space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
                      <FormField
                        control={form.control}
                        name="rangeType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-white">Generate until</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="text-sm bg-white/5 border-white/20 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-900 border-white/20">
                                <SelectItem value="UntilYearEnd" className="text-white hover:bg-white/10 focus:bg-white/10">End of academic year</SelectItem>
                                <SelectItem value="UntilSemesterEnd" className="text-white hover:bg-white/10 focus:bg-white/10">End of current semester</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {generateLessons && hasConflicts && (
                    <div className="pl-7">
                      <p className="text-xs text-orange-300/70 italic">
                        Resolve conflicts to configure lesson generation options
                      </p>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || hasConflicts || hasAnyOverlap}
                onClick={() => form.handleSubmit(handleSubmit)()}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
               Create Schedule
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>

      {/* Time Suggestions Dialog */}
      <Dialog
        open={showSuggestions}
        onOpenChange={(open) => {
          setShowSuggestions(open);
          if (!open) {
            setSelectedSuggestionIndex(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] bg-gray-900/95 backdrop-blur-md border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Available Time Slots
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Choose a time that works for everyone.
            </DialogDescription>
          </DialogHeader>

          <div
            className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
            role="radiogroup"
            aria-label="Available time slots"
          >
            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-white/60">Loading suggestions...</div>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-white/60">No available time slots found</div>
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedSuggestionIndex(index)}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    selectedSuggestionIndex === index
                      ? 'border-yellow-400 bg-white/5'
                      : 'border-white/10 hover:bg-white/5 hover:border-yellow-400/50'
                  }`}
                  role="radio"
                  aria-checked={selectedSuggestionIndex === index}
                >
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="text-xs font-medium uppercase tracking-wide text-white/60">
                        {suggestion.dayOfWeek}
                      </div>
                      <div className="mt-1 text-sm font-medium text-white">
                        {suggestion.startTime} - {suggestion.endTime}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 text-xs text-white/60">
              {selectedSuggestionIndex !== null && suggestions[selectedSuggestionIndex] ? (
                <span>
                  Selected{' '}
                  <span className="font-medium text-white">
                    {suggestions[selectedSuggestionIndex].dayOfWeek}{' '}
                    {suggestions[selectedSuggestionIndex].startTime}–
                    {suggestions[selectedSuggestionIndex].endTime}
                  </span>
                </span>
              ) : (
                <span>Select a time slot to apply it.</span>
              )}
            </div>
            <div className="flex gap-2 sm:gap-3 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowSuggestions(false)}
                className="text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={
                  selectedSuggestionIndex === null ||
                  selectedSuggestionIndex < 0 ||
                  selectedSuggestionIndex >= suggestions.length
                }
                onClick={() => {
                  if (
                    selectedSuggestionIndex !== null &&
                    selectedSuggestionIndex >= 0 &&
                    selectedSuggestionIndex < suggestions.length
                  ) {
                    handleApplySuggestion(suggestions[selectedSuggestionIndex]);
                  }
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm time
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
