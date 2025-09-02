import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FileText, Target, Book } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ClassFormData } from '@/types/api/class';

interface AdditionalDetailsTabProps {
  form: UseFormReturn<ClassFormData>;
}

const AdditionalDetailsTab: React.FC<AdditionalDetailsTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      {/* Requirements */}
      <FormField
        control={form.control}
        name="requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Requirements
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Enter class requirements (prerequisites, materials needed, etc.)"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[100px]"
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Objectives */}
      <FormField
        control={form.control}
        name="objectives"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white flex items-center gap-2">
              <Target className="w-4 h-4" />
              Learning Objectives
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Enter learning objectives (one per line)"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[100px]"
                value={Array.isArray(field.value) ? field.value.join('\n') : field.value || ''}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter(line => line.trim());
                  field.onChange(lines.length > 0 ? lines : null);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Materials */}
      <FormField
        control={form.control}
        name="materials"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white flex items-center gap-2">
              <Book className="w-4 h-4" />
              Materials & Resources
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="List required materials (one per line)"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[100px]"
                value={Array.isArray(field.value) ? field.value.join('\n') : field.value || ''}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter(line => line.trim());
                  field.onChange(lines.length > 0 ? lines : null);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Additional Information */}
      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Additional Notes
        </h4>
        <p className="text-white/70 text-sm mb-4">
          All fields in this section are optional and can be used to provide additional context for the class.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/60">
          <div>
            <strong>Requirements:</strong> Prerequisites and what students need
          </div>
          <div>
            <strong>Objectives:</strong> What students will learn and achieve
          </div>
          <div>
            <strong>Materials:</strong> Books, supplies, and resources needed
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalDetailsTab;
