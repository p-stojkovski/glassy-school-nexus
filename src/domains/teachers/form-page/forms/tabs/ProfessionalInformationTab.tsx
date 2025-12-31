import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { TeacherFormData } from '@/types/api/teacher';

interface ProfessionalInformationTabProps {
  form: UseFormReturn<TeacherFormData>;
}

const ProfessionalInformationTab: React.FC<ProfessionalInformationTabProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-semibold">
              Additional Notes
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Enter any additional notes about the teacher (bio, teaching style, certifications, etc.)"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 min-h-[150px] resize-none"
              />
            </FormControl>
            <FormMessage className="text-red-300" />
            <p className="text-xs text-white/50 mt-1">
              Maximum 500 characters. This information is visible only to administrators.
            </p>
          </FormItem>
        )}
      />
    </div>
  );
};

export default ProfessionalInformationTab;
