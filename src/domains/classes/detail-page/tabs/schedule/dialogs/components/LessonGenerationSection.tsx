import React from 'react';
import { Info } from 'lucide-react';
import { Control } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import {
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LessonGenerationFormData {
  generateLessons: boolean;
  rangeType: 'UntilYearEnd' | 'UntilSemesterEnd';
}

interface LessonGenerationSectionProps<T extends LessonGenerationFormData> {
  control: Control<T>;
  generateLessons: boolean;
  hasConflicts: boolean;
}

/**
 * Section for toggling lesson generation and selecting the generation range.
 * Used by AddScheduleSlotSheet.
 */
export function LessonGenerationSection<T extends LessonGenerationFormData>({
  control,
  generateLessons,
  hasConflicts,
}: LessonGenerationSectionProps<T>) {
  return (
    <div className="border-t border-white/20 pt-4 space-y-3">
      <FormField
        control={control as Control<LessonGenerationFormData>}
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
            control={control as Control<LessonGenerationFormData>}
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
  );
}
